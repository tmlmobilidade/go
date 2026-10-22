package trips_custom

import (
	"main/lib"
	"main/services"
	"main/types"
	trips_utils "main/validations/trips/utils"
)

func OnePatternPerShape(db *services.SQLiteContext, rules *types.RuleContext, reported map[[2]string]bool) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_one_pattern_id_per_shape_id_group"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("shape_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Check if the shape_id validation should run

	if ctx.ShouldSkip() {
		return nil
	}

	//
	// 4. Get the shape_id value

	shape, err := db.Trips.Field("shape_id")
	if err != nil {
		return err
	}

	//
	// 5. Collect the patterns associated with this shape

	patterns := map[string]bool{}

	//
	// 6. Track whether incomplete stop sequences prevent this check

	suppressed := false

	//
	// 7. Collect shape_id values for the shape_id group

	err = trips_utils.ForGroup(db, "shape_id", func(row *services.SQLiteRow) error {
		value, err := row.Field("pattern_id")
		if err != nil {
			return err
		}
		if value != "" {
			patterns[value] = true
			if reported[[2]string{value, shape}] {
				suppressed = true
			}
		}
		return nil
	})
	if err != nil {
		return err
	}

	//
	// 8. Check the shape_id multiple shape id in unique pattern id

	if len(patterns) > 1 && !suppressed {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("multiple_shape_id_in_unique_pattern_id", shape))
	}

	//
	// 9. Return success

	return nil
}
