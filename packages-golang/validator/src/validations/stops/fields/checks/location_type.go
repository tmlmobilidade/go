package stops_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func LocationTypeField(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//
	// 1. Get the rule

	const ruleID = "stops_location_type_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("location_type", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the location_type value

	value, err := db.Stops.Field("location_type")
	if err != nil {
		return err
	}

	//
	// 4. Check if the location_type is present

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