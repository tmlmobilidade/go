package shapes

import (
	"math"
	"strconv"
	"strings"

	"main/lib"
	"main/services"
	shapes_coordinates "main/services/geo/shapes"
	"main/types"
	shapeutils "main/validations/shapes/utils"
)

// Default tolerance between the recorded shape_dist_traveled delta and the real
// (haversine) distance between two consecutive points, in meters.
const maxDistanceDeltaToleranceMeters = 20.0

type distanceViolation struct {
	shapeID            string
	previousSeq        int
	currentSeq         int
	row                int
	prevLat            float64
	prevLon            float64
	currentLat         float64
	currentLon         float64
	distTraveledDeltaM float64 // converted to meters for comparison
	realDistanceMeters float64
}

// getShapePointsCoordinatesDistancesToleranceMeters resolves the configurable
// tolerance from rules.Options[0] (meters), falling back to the default when
// rules, options or the value itself are missing or invalid.
func getShapePointsCoordinatesDistancesToleranceMeters(rules *types.ShapesRules) float64 {
	if rules == nil || rules.ShapePointsCoordinatesDistances.Options == nil || len(*rules.ShapePointsCoordinatesDistances.Options) == 0 {
		return maxDistanceDeltaToleranceMeters
	}

	value, err := strconv.ParseFloat((*rules.ShapePointsCoordinatesDistances.Options)[0], 64)
	if err != nil || value < 0 || math.IsNaN(value) || math.IsInf(value, 0) {
		return maxDistanceDeltaToleranceMeters
	}

	return value
}

// uniqueDistanceRows deduplicates row numbers while preserving their first-seen order,
// so the collapsed "many errors" report emits one message per row instead of one per violation.
func uniqueDistanceRows(rows []int) []int {
	seen := make(map[int]struct{}, len(rows))
	unique := make([]int, 0, len(rows))
	for _, row := range rows {
		if _, ok := seen[row]; ok {
			continue
		}
		seen[row] = struct{}{}
		unique = append(unique, row)
	}
	return unique
}

// shapeDistanceScale allows an explicit unit for short shapes where magnitude
// alone cannot distinguish meters from kilometers. Without it, retain the
// existing auto-detection used by the other shape-distance checks.
func shapeDistanceScale(rules *types.ShapesRules, maxInShape float64) float64 {
	if rules != nil && rules.ShapePointsCoordinatesDistances.Options != nil {
		options := *rules.ShapePointsCoordinatesDistances.Options
		if len(options) > 1 {
			switch strings.ToLower(strings.TrimSpace(options[1])) {
			case "m":
				return 1
			case "km":
				return 1000
			}
		}
	}
	return shapes_coordinates.ShapeDistTraveledToMeters(1, maxInShape)
}

// ShapePointsCoordinatesDistancesValidation compares each cumulative-distance
// increment with its Haversine segment, including the first segment from zero.
// Decreases belong to the monotonic-distance rule, not this geometric check.
func ShapePointsCoordinatesDistancesValidation(shapes []types.Shape, rules *types.ShapesRules) {
	severity := types.SEVERITY_IGNORE
	if rules != nil {
		severity = rules.ShapePointsCoordinatesDistances.Severity
	}
	if severity == "" || severity == types.SEVERITY_IGNORE {
		return
	}

	toleranceMeters := getShapePointsCoordinatesDistancesToleranceMeters(rules)
	violations := []distanceViolation{}
	for _, points := range shapeutils.OrderedPoints(shapes) {
		var maxDistTraveled float64
		for _, point := range points {
			if shapeutils.ValidDistance(point.Distance) && *point.Distance > maxDistTraveled {
				maxDistTraveled = *point.Distance
			}
		}
		scale := shapeDistanceScale(rules, maxDistTraveled)
		for i := 1; i < len(points); i++ {
			prev, current := points[i-1], points[i]
			if !prev.ValidCoordinates || !current.ValidCoordinates ||
				!shapeutils.ValidDistance(prev.Distance) || !shapeutils.ValidDistance(current.Distance) {
				continue
			}
			delta := *current.Distance - *prev.Distance
			if delta < 0 {
				continue
			}
			realDistanceMeters := lib.HaversineDistance(prev.Coordinates, current.Coordinates)
			deltaMeters := delta * scale
			// Keep a micrometer allowance for floating-point cancellation at a
			// configured zero tolerance; it is not a distance reset threshold.
			if math.Abs(realDistanceMeters-deltaMeters) <= toleranceMeters+1e-6 {
				continue
			}
			violations = append(violations, distanceViolation{
				shapeID:            current.ShapeID,
				previousSeq:        prev.Sequence,
				currentSeq:         current.Sequence,
				row:                current.Row,
				prevLat:            prev.Coordinates.Lat,
				prevLon:            prev.Coordinates.Lng,
				currentLat:         current.Coordinates.Lat,
				currentLon:         current.Coordinates.Lng,
				distTraveledDeltaM: deltaMeters,
				realDistanceMeters: realDistanceMeters,
			})
		}
	}

	// Report one collapsed message per row when a shape is broken beyond a useful point.
	// Past this many violations, per-pair detail stops being useful (it's usually one systemic
	// cause, e.g. a wrong unit for the whole shape) and would otherwise flood the output.
	if len(violations) > 100 {
		rows := make([]int, 0, len(violations))
		for _, violation := range violations {
			rows = append(rows, violation.row)
		}

		for _, row := range uniqueDistanceRows(rows) {
			ctx := lib.NewValidationContext("shape_dist_traveled", "shapes.txt", "shape_dist_traveled_delta_mismatches_haversine_segment", row, services.AppMessageService)
			ctx.WithSeverity(severity)
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_points_coordinates_distances_validation.ManyErrors"))
		}
		return
	}

	for _, violation := range violations {
		ctx := lib.NewValidationContext("shape_dist_traveled", "shapes.txt", "shape_dist_traveled_delta_mismatches_haversine_segment", violation.row, services.AppMessageService)
		ctx.WithSeverity(severity)
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage(
			"shape_points_coordinates_distances_validation.invalid_distances",
			strconv.FormatFloat(violation.prevLat, 'f', -1, 64),
			strconv.FormatFloat(violation.prevLon, 'f', -1, 64),
			strconv.FormatFloat(violation.currentLat, 'f', -1, 64),
			strconv.FormatFloat(violation.currentLon, 'f', -1, 64),
			violation.distTraveledDeltaM,
			violation.realDistanceMeters,
			violation.shapeID,
			violation.previousSeq,
			violation.currentSeq,
			toleranceMeters,
		))
	}
}
