package stops_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func StopIdUnique(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//
	
	//
	// 1. Get the rule
	
	const ruleID = "stops_stop_id_unique"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("stop_id_unique", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the stop_id value

	value, count, err := db.Stops.FieldWithCount("stop_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the stop_id is unique

	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}