package stops_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"slices"
)

func HasStopSignValid(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_has_stop_sign_valid"

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
	// 4. Check if the has_stop_sign is valid

	validValues := []string{"0", "1", "2", "3"}
	if !slices.Contains(validValues, value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
