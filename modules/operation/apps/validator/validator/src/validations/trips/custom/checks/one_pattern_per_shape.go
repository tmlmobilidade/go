package trips_custom

import (
	"main/lib"
	"main/services"
	"main/types"
	trips_utils "main/validations/trips/utils"
)

func OnePatternPerShape(db *services.SQLiteContext, rules *types.RuleContext, reported map[[2]string]bool) error {
	const ruleID = "trips_one_pattern_id_per_shape_id_group"
	ctx := lib.NewValidationContext("shape_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	if ctx.ShouldSkip() {
		return nil
	}
	shape, err := db.Trips.Field("shape_id")
	if err != nil {
		return err
	}
	patterns := map[string]bool{}
	suppressed := false
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
	if len(patterns) > 1 && !suppressed {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("multiple_shape_id_in_unique_pattern_id", shape))
	}
	return nil
}
