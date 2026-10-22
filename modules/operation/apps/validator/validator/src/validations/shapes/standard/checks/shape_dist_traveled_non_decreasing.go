package shapes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"main/validations/shapes/utils"
)

// ShapeDistTraveledNonDecreasing compares distances in sequence order.
// Equal distances are allowed. Missing or negative distances break a comparison;
// this check does not bridge across them or replace the non-negative-value rule.
func ShapeDistTraveledNonDecreasing(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "shape_dist_traveled_non_decreasing_with_sequence"

	// Read only the current shape's sequence and distance values from SQLite.
	groups, err := utils.SequenceGroups(db)
	if err != nil {
		return err
	}

	//
	// 2. Compare neighbouring points within each independently ordered shape.

	for _, points := range groups {
		for i := 1; i < len(points); i++ {
			point, previous := points[i], points[i-1]
			if point.Distance == nil || previous.Distance == nil {
				continue
			}
			if *point.Distance < 0 || *previous.Distance < 0 {
				continue
			}
			if !(*point.Distance < *previous.Distance) {
				continue
			}

			// 3. Report the decrease on the current point, using its source row.
			ctx := lib.NewValidationContext("shape_dist_traveled", "shapes.txt", ruleID, point.Row, services.AppMessageService)
			if rules != nil {
				rule := rules
				ctx.WithSeverity(rule.Severity)
			}
			if ctx.ShouldSkip() {
				continue
			}
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_increasing", point.ShapeID))
		}
	}

	//
	// 4. Return success

	return nil
}
