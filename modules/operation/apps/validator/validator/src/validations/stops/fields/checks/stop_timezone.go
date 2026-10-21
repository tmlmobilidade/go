package stops_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func StopTimezoneValidation(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//
	
	//
	// 1. Get the rule

	const ruleID = "stops_stop_timezone_validation"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("stop_timezone", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the stop_timezone value

	value, err := db.Stops.Field("stop_timezone")
	if err != nil {
		return err
	}

	//
	// 4. Check if the stop_timezone is present

	if value == "" {
		if ctx.ShouldIgnore() {
			return nil
		}
		
		message := ctx.GetSeverityMessage("required", "recommended", "informational")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 5. Return success

	return nil
}