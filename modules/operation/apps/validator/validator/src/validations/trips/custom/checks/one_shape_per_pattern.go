package trips_custom

import (
	"main/lib"
	"main/services"
	"main/types"
	trips_utils "main/validations/trips/utils"
)

func OneShapePerPattern(db *services.SQLiteContext, rules *types.RuleContext, reported map[[2]string]bool) error {
	const ruleID = "trips_one_shape_id_per_pattern_id_group"
	ctx := lib.NewValidationContext("shape_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	if ctx.ShouldSkip() {
		return nil
	}
	pattern, err := db.Trips.Field("pattern_id")
	if err != nil {
		return err
	}
	shapes := map[string]bool{}
	err = trips_utils.ForGroup(db, "pattern_id", func(row *services.SQLiteRow) error {
		value, err := row.Field("shape_id")
		if err != nil {
			return err
		}
		if value != "" {
			shapes[value] = true
		}
		return nil
	})
	if err != nil {
		return err
	}
	if len(shapes) > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("different_shape_id", pattern))
		for shape := range shapes {
			reported[[2]string{pattern, shape}] = true
		}
	}
	return nil
}
