package fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func StopTimesTripIdField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//
	// 1. Get the rule

	const ruleID = "stop_times_trip_id_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("trip_id", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the trip_id value

	value, err := db.StopTimes.Field("trip_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the trip_id is required

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
