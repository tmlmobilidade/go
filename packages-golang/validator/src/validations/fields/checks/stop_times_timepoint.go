package fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func TimepointField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stop_times_timepoint_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("timepoint", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the timepoint value

	value, err := db.StopTimes.Field("timepoint")
	if err != nil {
		return err
	}

	//
	// 4. Check if the timepoint is required

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
