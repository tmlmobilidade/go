package stops_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func StopAccessValid(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_stop_access_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("stop_access", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the stop_access value

	value, err := db.Stops.Field("stop_access")
	if err != nil {
		return err
	}

	//
	// 4. Check if the stop_access is valid

	if value != "0" && value != "1" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}