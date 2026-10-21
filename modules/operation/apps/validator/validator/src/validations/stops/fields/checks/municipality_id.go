package stops_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func MunicipalityIdField(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
    //
	
	//
	// 1. Get the rule

	const ruleID = "stops_municipality_id_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("municipality_id", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the municipality_id value

	value, err := db.Stops.Field("municipality_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the municipality_id is present

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