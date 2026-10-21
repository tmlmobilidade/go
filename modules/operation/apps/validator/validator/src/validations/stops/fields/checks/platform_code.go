package stops_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func PlatformCodeValidation(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//
	
	//
	// 1. Get the rule

	const ruleID = "stops_platform_code_validation"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("platform_code", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the platform_code value

	value, err := db.Stops.Field("platform_code")
	if err != nil {
		return err
	}

	//
	// 4. Check if the platform_code is present

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