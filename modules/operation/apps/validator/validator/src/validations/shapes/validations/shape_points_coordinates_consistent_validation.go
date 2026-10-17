package shapes

import (
	"math"
	"strconv"

	"main/lib"
	"main/services"
	shapes_coordinates "main/services/geo/shapes"
	"main/types"
	shapeutils "main/validations/shapes/utils"
)

type pointsCoordinatesConsistentViolation struct {
	shapeId        string
	row            int
	currentLat     float64
	currentLon     float64
	currentSeq     int
	previousLat    float64
	previousLon    float64
	previousSeq    int
	distanceMeters float64
}

// getShapePointsCoordinatesConsistentToleranceMeters resolves the configurable
// tolerance from rules.Options[0] (meters), falling back to the default when
// rules, options or the value itself are missing or invalid.
func getShapePointsCoordinatesConsistentToleranceMeters(rules *types.ShapesRules) float64 {
	if rules == nil || rules.ShapePointsCoordinatesConsistent.Options == nil || len(*rules.ShapePointsCoordinatesConsistent.Options) == 0 {
		return shapes_coordinates.MAX_SHAPE_POINT_DISTANCE_METERS
	}

	value, err := strconv.ParseFloat((*rules.ShapePointsCoordinatesConsistent.Options)[0], 64)
	if err != nil || value <= 0 || math.IsNaN(value) || math.IsInf(value, 0) {
		return shapes_coordinates.MAX_SHAPE_POINT_DISTANCE_METERS
	}

	return value
}

// uniquePointsCoordinatesConsistentRows deduplicates row numbers while preserving their
// first-seen order, so the collapsed "many errors" report emits one message per row instead
// of one per violation.
func uniquePointsCoordinatesConsistentRows(rows []int) []int {
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

// ShapePointsCoordinatesConsistentValidation checks consecutive coordinate gaps,
// independent of shape_dist_traveled. The public rule ID is retained for saved settings.
func ShapePointsCoordinatesConsistentValidation(shapes []types.Shape, rules *types.ShapesRules) {
	severity := types.SEVERITY_IGNORE
	if rules != nil {
		severity = rules.ShapePointsCoordinatesConsistent.Severity
	}
	if severity == "" || severity == types.SEVERITY_IGNORE {
		return
	}

	toleranceMeters := getShapePointsCoordinatesConsistentToleranceMeters(rules)
	violations := []pointsCoordinatesConsistentViolation{}
	for _, points := range shapeutils.OrderedPoints(shapes) {
		for i := 1; i < len(points); i++ {
			prev, current := points[i-1], points[i]
			if !prev.ValidCoordinates || !current.ValidCoordinates {
				continue
			}
			distanceMeters := lib.HaversineDistance(prev.Coordinates, current.Coordinates)
			if distanceMeters <= toleranceMeters {
				continue
			}
			violations = append(violations, pointsCoordinatesConsistentViolation{
				shapeId:        current.ShapeID,
				row:            current.Row,
				currentLat:     current.Coordinates.Lat,
				currentLon:     current.Coordinates.Lng,
				currentSeq:     current.Sequence,
				previousLat:    prev.Coordinates.Lat,
				previousLon:    prev.Coordinates.Lng,
				previousSeq:    prev.Sequence,
				distanceMeters: distanceMeters,
			})
		}
	}

	// Report one collapsed message per row when a shape is broken beyond a useful point.
	// Past this many violations, per-pair detail stops being useful (it's usually one systemic
	// cause, e.g. reordered points or a merged shape) and would otherwise flood the output.
	if len(violations) > 100 {
		rows := make([]int, 0, len(violations))
		for _, violation := range violations {
			rows = append(rows, violation.row)
		}

		for _, row := range uniquePointsCoordinatesConsistentRows(rows) {
			ctx := lib.NewValidationContext("shape_pt_sequence", "shapes.txt", "shape_sequence_position_mismatches_cumulative_traveled_distance", row, services.AppMessageService)
			ctx.WithSeverity(severity)
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("ManyErrors"))
		}
		return
	}

	for _, violation := range violations {
		ctx := lib.NewValidationContext("shape_pt_sequence", "shapes.txt", "shape_sequence_position_mismatches_cumulative_traveled_distance", violation.row, services.AppMessageService)
		ctx.WithSeverity(severity)
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage(
			"invalid_consistent_distance",
			violation.shapeId,
			violation.currentLat,
			violation.currentLon,
			violation.currentSeq,
			violation.previousLat,
			violation.previousLon,
			violation.previousSeq,
			violation.distanceMeters,
			toleranceMeters,
		))
	}
}
