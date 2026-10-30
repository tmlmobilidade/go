package fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func PickupTypeField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stop_times_pickup_type_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("pickup_type", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the pickup_type value

	value, err := db.StopTimes.Field("pickup_type")
	if err != nil {
		return err
	}

	//
	// 4. Check if the pickup_type is required

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
