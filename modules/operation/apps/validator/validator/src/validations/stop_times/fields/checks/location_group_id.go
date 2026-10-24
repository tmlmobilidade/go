package stop_times_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func LocationGroupIdField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stop_times_location_group_id_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("location_group_id", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the location_group_id value

	value, err := db.StopTimes.Field("location_group_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if stop_id or location_id is defined

	if db.StopTimes.Exists("stop_id", value) || db.StopTimes.Exists("location_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden_stop_location"))
		return nil
	}

	//
	// 5. Return success

	return nil
}
