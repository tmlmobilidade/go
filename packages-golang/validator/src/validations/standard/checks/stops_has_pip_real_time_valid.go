package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"slices"
)

func HasPipRealTimeValid(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_has_pip_real_time_valid"

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
	// 4. Check if the has_pip_real_time is valid

	validValues := []string{"0", "1", "2"}
	if !slices.Contains(validValues, value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
