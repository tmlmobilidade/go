package stops_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func HasPipRealTimeField(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_has_pip_real_time_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("has_pip_real_time", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the has_pip_real_time value

	value, err := db.Stops.Field("has_pip_real_time")
	if err != nil {
		return err
	}

	//
	// 4. Check if the has_pip_real_time is present

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