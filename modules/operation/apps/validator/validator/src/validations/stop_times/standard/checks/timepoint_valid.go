package stop_times_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func TimepointValid(db *services.SQLiteContext, rules *types.StopTimesRules) error {
	//
	// 1. Get the rule

	const ruleID = "stop_times_timepoint_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("timepoint", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the timepoint value

	value, err := db.StopTimes.Field("timepoint")
	if err != nil {
		return err
	}
	
	//
	// 4. Check if the timepoint is valid

	if value != "0" && value != "1" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}
	
	//
	// 5. Return success

	return nil
}