package fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func HasStopSignField(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_has_stop_sign_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("has_stop_sign", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the has_stop_sign value

	value, err := db.Stops.Field("has_stop_sign")
	if err != nil {
		return err
	}

	//
	// 4. Check if the has_stop_sign is present

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
