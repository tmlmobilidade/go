package shapes

import (
	"main/lib"
	"main/services"
	"main/types"
	"sort"
)

type ShapePtSequenceGroup struct {
	shapeId  string
	sequence int
	dist     float64
	row      int
}

/*
Validate the shape sequence, based on shape_pt_sequence and shape_dist_traveled.

https://gtfs.org/schedule/reference/#shapestxt
*/
func ShapeSequenceValidation(shapes []types.Shape, rules *types.ShapesRules) {
	// Group shapes by shape_id
	shapeGroups := make(map[string][]ShapePtSequenceGroup)

	for i, shape := range shapes {
		ctx := lib.NewValidationContext("shape_pt_sequence", "shapes.txt", "shape_id_and_point_sequence_required", i, services.AppMessageService)
		ctx.WithSeverity(types.SEVERITY_ERROR)
		if rules != nil && rules.ShapeIdAndPointSequenceRequired.Severity != "" {
			ctx.WithSeverity(rules.ShapeIdAndPointSequenceRequired.Severity)
		}

		if shape.ShapeId == nil || shape.ShapePtSequence == nil {
			if ctx.ShouldSkip() {
				return
			}
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_pt_sequence_validation.required"))
			return
		}

		// Only add to group if shape_id and shape_pt_sequence are present
		group := ShapePtSequenceGroup{
			shapeId:  *shape.ShapeId,
			sequence: *shape.ShapePtSequence,
			row:      i,
		}
		if shape.ShapeDistTraveled != nil {
			group.dist = *shape.ShapeDistTraveled
		} else {
			group.dist = -1 // Use -1 to indicate missing distance
		}
		shapeGroups[*shape.ShapeId] = append(shapeGroups[*shape.ShapeId], group)
	}

	// Sort shapeGroups by sequence
	for _, shapeGroup := range shapeGroups {
		sort.Slice(shapeGroup, func(i, j int) bool {
			return shapeGroup[i].sequence < shapeGroup[j].sequence
		})

		// Check if the shape_pt_sequence values are increasing
		for i, shape := range shapeGroup {
			if i > 0 {
				ctx := lib.NewValidationContext("shape_pt_sequence", "shapes.txt", "shape_pt_sequence_strictly_increasing", shape.row, services.AppMessageService)
				ctx.WithSeverity(types.SEVERITY_ERROR)
				if rules != nil && rules.ShapePtSequenceStrictlyIncreasing.Severity != "" {
					ctx.WithSeverity(rules.ShapePtSequenceStrictlyIncreasing.Severity)
				}
				if shape.sequence <= shapeGroup[i-1].sequence {
					if !ctx.ShouldSkip() {
						ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_pt_sequence_validation.not_increasing", shape.shapeId))
					}
				}
				// Only check dist if both current and previous are present
				if shape.dist >= 0 && shapeGroup[i-1].dist >= 0 {
					if shape.dist < shapeGroup[i-1].dist {
						ctxDist := lib.NewValidationContext("shape_dist_traveled", "shapes.txt", "shape_dist_traveled_non_decreasing_with_sequence", shape.row, services.AppMessageService)
						ctxDist.WithSeverity(types.SEVERITY_ERROR)
						if rules != nil && rules.ShapeDistTraveledNonDecreasingWithSequence.Severity != "" {
							ctxDist.WithSeverity(rules.ShapeDistTraveledNonDecreasingWithSequence.Severity)
						}
						if !ctxDist.ShouldSkip() {
							ctxDist.AddMessageWithSeverity(ctxDist.GetTranslatedMessage("shape_dist_traveled_validation.not_increasing", shape.shapeId))
						}
					}
				}
			}
		}
	}
}
