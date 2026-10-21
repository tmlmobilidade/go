package stop_times_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ContinuousPickupField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stop_times_continuous_pickup_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("continuous_pickup", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the continuous_pickup value

	value, err := db.StopTimes.Field("continuous_pickup")
	if err != nil {
		return err
	}

	//
	// 4. Check if the continuous_pickup is required

	if value == "" {
		if ctx.ShouldSkip() {
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
