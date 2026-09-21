package shapes

import (
	"sort"
	"strconv"

	"main/lib"
	"main/services"
	shapes_coordinates "main/services/geo/shapes"
	"main/types"
)

type shapePointsCoordinatesConsistentPoint struct {
	id       string
	row      int
	sequence int
	lat      float64
	lon      float64
}

func getShapePointsCoordinatesConsistentToleranceMeters(rules *types.ShapesRules) float64 {
	if rules == nil || rules.ShapePointsCoordinatesConsistent.Options == nil || len(*rules.ShapePointsCoordinatesConsistent.Options) == 0 {
		return shapes_coordinates.MAX_SHAPE_POINT_DISTANCE_METERS
	}

	value, err := strconv.ParseFloat((*rules.ShapePointsCoordinatesConsistent.Options)[0], 64)
	if err != nil || value <= 0 {
		return shapes_coordinates.MAX_SHAPE_POINT_DISTANCE_METERS
	}

	return value
}

func buildShapeFromPointsCoordinatesConsistentPoint(point shapePointsCoordinatesConsistentPoint) *types.Shape {
	return &types.Shape{
		ShapePtLat: lib.Ptr(point.lat),
		ShapePtLon: lib.Ptr(point.lon),
	}
}

type pointsCoordinatesConsistentViolation struct {
	shapeId     string
	row         int
	currentLat  float64
	currentLon  float64
	currentSeq  int
	previousLat float64
	previousLon float64
	previousSeq int
}

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

// ShapePointsCoordinatesConsistentValidation validates if consecutive points from the same shape are not too far apart.
func ShapePointsCoordinatesConsistentValidation(shapes []types.Shape, rules *types.ShapesRules) {
	severity := types.SEVERITY_ERROR
	if rules != nil && rules.ShapePointsCoordinatesConsistent.Severity != "" {
		severity = types.Severity(rules.ShapePointsCoordinatesConsistent.Severity)
	}

	shapeGroups := map[string][]shapePointsCoordinatesConsistentPoint{}
	toleranceMeters := getShapePointsCoordinatesConsistentToleranceMeters(rules)
	violations := []pointsCoordinatesConsistentViolation{}

	for i, shape := range shapes {
		if shape.ShapeId == nil || *shape.ShapeId == "" {
			continue
		}
		if shape.ShapePtSequence == nil || shape.ShapePtLat == nil || shape.ShapePtLon == nil {
			continue
		}

		shapeGroups[*shape.ShapeId] = append(shapeGroups[*shape.ShapeId], shapePointsCoordinatesConsistentPoint{
			id:       *shape.ShapeId,
			row:      i,
			sequence: *shape.ShapePtSequence,
			lat:      *shape.ShapePtLat,
			lon:      *shape.ShapePtLon,
		})
	}

	for _, shapeGroup := range shapeGroups {
		sort.Slice(shapeGroup, func(i, j int) bool {
			return shapeGroup[i].sequence < shapeGroup[j].sequence
		})

		for i := 1; i < len(shapeGroup); i++ {
			if shapeGroup[i].sequence == 0 {
				i++
			}
			prev := shapeGroup[i-1]
			current := shapeGroup[i]
			prevShapePoint := buildShapeFromPointsCoordinatesConsistentPoint(prev)
			currentShapePoint := buildShapeFromPointsCoordinatesConsistentPoint(current)

			closeEnough := shapes_coordinates.ShapePointIsCloseToBeforeShapePoint(prevShapePoint, currentShapePoint, toleranceMeters)
			if closeEnough {
				continue
			}

			violations = append(violations, pointsCoordinatesConsistentViolation{
				shapeId:     current.id,
				row:         current.row,
				currentLat:  current.lat,
				currentLon:  current.lon,
				currentSeq:  current.sequence,
				previousLat: prev.lat,
				previousLon: prev.lon,
				previousSeq: prev.sequence,
			})
		}
	}

	if len(violations) > 100 {
		rows := make([]int, 0, len(violations))
		for _, violation := range violations {
			rows = append(rows, violation.row)
		}

		for _, row := range uniquePointsCoordinatesConsistentRows(rows) {
			ctx := lib.NewValidationContext("shape_sequence", "shapes.txt", "shape_sequence_position_mismatches_cumulative_traveled_distance", row, services.AppMessageService)
			ctx.WithSeverity(severity)
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_points_coordinates_consistent_validation.ManyErrors"))
		}
		return
	}

	for _, violation := range violations {
		ctx := lib.NewValidationContext("shape_sequence", "shapes.txt", "shape_sequence_position_mismatches_cumulative_traveled_distance", violation.row, services.AppMessageService)
		ctx.WithSeverity(severity)
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage(
			"shape_points_coordinates_consistent_validation.invalid_consistent_distance",
			violation.shapeId,
			violation.currentLat,
			violation.currentLon,
			violation.currentSeq,
			violation.previousLat,
			violation.previousLon,
			violation.previousSeq,
		))
	}
}
