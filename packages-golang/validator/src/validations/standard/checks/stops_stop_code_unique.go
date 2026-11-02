package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func StopCodeUnique(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_stop_code_unique"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("stop_code", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the stop_code value

	value, count, err := db.Stops.FieldWithCount("stop_code")
	if err != nil {
		return err
	}

	//
	// 4. Check if the stop_code is unique

	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
