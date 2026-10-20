package shapes_custom

import (
	"math"
	"sort"
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

// distanceViolation represents a violation of the shape points coordinates distances rule.
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
	if rules == nil || rules.Rule("shapes_shape_dist_traveled_segment_valid").Options == nil || len(*rules.Rule("shapes_shape_dist_traveled_segment_valid").Options) == 0 {
		return maxDistanceDeltaToleranceMeters
	}

	value, err := strconv.ParseFloat((*rules.Rule("shapes_shape_dist_traveled_segment_valid").Options)[0], 64)
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
	if rules != nil && rules.Rule("shapes_shape_dist_traveled_segment_valid").Options != nil {
		options := *rules.Rule("shapes_shape_dist_traveled_segment_valid").Options
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

// ShapePointsCoordinatesDistances compares each cumulative-distance
// increment with its Haversine segment, including the first segment from zero.
// Decreases belong to the monotonic-distance rule, not this geometric check.
func ShapePointsCoordinatesDistances(db *services.SQLiteContext, rules *types.ShapesRules) error {
	//

	//
	// 1. Get the rule and severity

	const ruleID = "shapes_shape_dist_traveled_segment_valid"

	//
	// 2. Get the severity

	severity := types.SEVERITY_IGNORE
	if rules != nil {
		severity = rules.Rule(ruleID).Severity
	}

	if severity == "" || severity == types.SEVERITY_IGNORE {
		return nil
	}

	//
	// 3. Get the tolerance

	toleranceMeters := getShapePointsCoordinatesDistancesToleranceMeters(rules)

	//
	// 4. Read this shape's sequence, coordinates, and distances from SQLite

	shapeID, err := db.Shapes.Field("shape_id")
	if err != nil {
		return err
	}

	//
	// 5. Read the points from the table

	table, err := db.Table("shapes")
	if err != nil {
		return err
	}

	//
	// 6. Parse the points

	points := []shapeutils.Point{}
	invalidSequence := false
	err = table.ForEachMatching("shape_id", shapeID, func(row *services.SQLiteRow) error {
		values, err := row.Fields("shape_pt_sequence", "shape_pt_lat", "shape_pt_lon", "shape_dist_traveled")
		if err != nil {
			return err
		}
		sequence, err := strconv.Atoi(values["shape_pt_sequence"])
		if err != nil || sequence < 0 {
			invalidSequence = true
			return nil
		}
		lat, latErr := strconv.ParseFloat(values["shape_pt_lat"], 64)
		lon, lonErr := strconv.ParseFloat(values["shape_pt_lon"], 64)
		// Keep invalid values in the sequence so their neighbours are never joined.
		point := shapeutils.Point{
			ShapeID:          shapeID,
			Row:              row.Row,
			Sequence:         sequence,
			Coordinates:      types.Coordinates{Lat: lat, Lng: lon},
			ValidCoordinates: latErr == nil && lonErr == nil && lib.ValidateLatitude(lat) && lib.ValidateLongitude(lon),
		}
		if distance, err := strconv.ParseFloat(values["shape_dist_traveled"], 64); err == nil {
			point.Distance = &distance
		}
		points = append(points, point)
		return nil
	})
	if err != nil {
		return err
	}
	if invalidSequence {
		return nil
	}

	//
	// 7. Order the points, skipping shapes with ambiguous sequences

	sort.SliceStable(points, func(i, j int) bool { return points[i].Sequence < points[j].Sequence })
	for i := 1; i < len(points); i++ {
		if points[i].Sequence == points[i-1].Sequence {
			return nil
		}
	}

	//
	// 8. Resolve the recorded-distance unit for this shape

	var maxDistTraveled float64
	for _, point := range points {
		if shapeutils.ValidDistance(point.Distance) && *point.Distance > maxDistTraveled {
			maxDistTraveled = *point.Distance
		}
	}
	scale := shapeDistanceScale(rules, maxDistTraveled)

	//
	// 9. Compare each recorded increment with its geometric segment

	violations := []distanceViolation{}
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

	//
	// 10. Report the violations

	for _, violation := range violations {
		ctx := lib.NewValidationContext("shape_dist_traveled", "shapes.txt", ruleID, violation.row, services.AppMessageService)
		ctx.WithSeverity(severity)
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage(
			"invalid_distances",
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

	//
	// 11. Return nil

	return nil
}
