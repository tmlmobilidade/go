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
ShapeSequenceValidation runs every check in ShapeSequenceRuleValidation (shape_id and
shape_pt_sequence presence, shape_pt_sequence strictly increasing, and shape_dist_traveled
not decreasing along with it) for all shape points.

https://gtfs.org/schedule/reference/#shapestxt
*/
func ShapeSequenceValidation(shapes []types.Shape, rules *types.ShapesRules) {
	ShapeSequenceRuleValidation(shapes, rules, "")
}

/*
ShapeSequenceRuleValidation implements three related rules in one pass, since they all need
the same shape_id-grouped, sequence-ordered points. ruleID selects which one actually reports
a message ("" runs all three); the other two still execute to build/order the groups, but
their message blocks are skipped when ruleID names a different rule. This lets each rule be
registered and toggled independently by the rule runner while sharing one grouping pass.
*/
func ShapeSequenceRuleValidation(shapes []types.Shape, rules *types.ShapesRules, ruleID string) {
	// 1. Group the points by shape_id, requiring shape_id and shape_pt_sequence on each one
	shapeGroups := make(map[string][]ShapePtSequenceGroup)

	for i, shape := range shapes {
		if shape.Row != nil {
			i = *shape.Row
		}
		ctx := lib.NewValidationContext("shape_pt_sequence", "shapes.txt", "shape_id_and_point_sequence_required", i, services.AppMessageService)
		if rules != nil && rules.ShapeIdAndPointSequenceRequired.Severity != "" {
			ctx.WithSeverity(rules.ShapeIdAndPointSequenceRequired.Severity)
		}

		if shape.ShapeId == nil || shape.ShapePtSequence == nil {
			if ruleID != "" && ruleID != "shape_id_and_point_sequence_required" {
				continue
			}
			if ctx.ShouldSkip() {
				return
			}
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_pt_sequence_validation.required"))
			// A point without shape_id/shape_pt_sequence can't be grouped or ordered, so the
			// rest of the file (including other shapes) is left unchecked rather than guessed at.
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

	// 2. Order each shape's points by shape_pt_sequence
	for _, shapeGroup := range shapeGroups {
		sort.Slice(shapeGroup, func(i, j int) bool {
			return shapeGroup[i].sequence < shapeGroup[j].sequence
		})

		// 3. Check that shape_pt_sequence strictly increases, and that
		// shape_dist_traveled does not decrease along with it
		for i, shape := range shapeGroup {
			if i > 0 {
				// sequence is compared against the previous point in sort order, not the
				// previous row in the file, so out-of-order rows in the source file are
				// still caught correctly here.
				ctx := lib.NewValidationContext("shape_pt_sequence", "shapes.txt", "shape_pt_sequence_strictly_increasing", shape.row, services.AppMessageService)
				if rules != nil && rules.ShapePtSequenceStrictlyIncreasing.Severity != "" {
					ctx.WithSeverity(rules.ShapePtSequenceStrictlyIncreasing.Severity)
				}
				if shape.sequence <= shapeGroup[i-1].sequence && (ruleID == "" || ruleID == "shape_pt_sequence_strictly_increasing") {
					if !ctx.ShouldSkip() {
						ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_pt_sequence_validation.not_increasing", shape.shapeId))
					}
				}
				// Only check dist if both current and previous are present (dist == -1
				// is the "missing" sentinel set above, not a real decrease).
				if shape.dist >= 0 && shapeGroup[i-1].dist >= 0 && (ruleID == "" || ruleID == "shape_dist_traveled_non_decreasing_with_sequence") {
					if shape.dist < shapeGroup[i-1].dist {
						ctxDist := lib.NewValidationContext("shape_dist_traveled", "shapes.txt", "shape_dist_traveled_non_decreasing_with_sequence", shape.row, services.AppMessageService)
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
