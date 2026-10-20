package stop_times_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func StartPickupDropOffWindowField(db *services.SQLiteContext, rules *types.StopTimesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stop_times_start_pickup_drop_off_window_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("start_pickup_drop_off_window", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the start_pickup_drop_off_window value

	values, err := db.StopTimes.Fields("start_pickup_drop_off_window", "arrival_time", "departure_time")
	if err != nil {
		return err
	}

	//
	// 4. Check if the start_pickup_drop_off_window is required

	if values["start_pickup_drop_off_window"] == "" && values["arrival_time"] == "" && values["departure_time"] == "" {
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
