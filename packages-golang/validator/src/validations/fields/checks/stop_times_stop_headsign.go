package fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func StopHeadsignField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stop_times_stop_headsign_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("stop_headsign", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the stop_headsign value

	value, err := db.StopTimes.Field("stop_headsign")
	if err != nil {
		return err
	}

	//
	// 4. Check if the stop_headsign is required

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
