package stops_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func LevelIdField(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_level_id_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("level_id", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the level_id value

	value, err := db.Stops.Field("level_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the level_id is present

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