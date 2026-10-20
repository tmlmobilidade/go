package stop_times_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func DepartureTimeField(db *services.SQLiteContext, rules *types.StopTimesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stop_times_departure_time_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("departure_time", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the departure_time value

	value, err := db.StopTimes.Field("departure_time")
	if err != nil {
		return err
	}

	//
	// 4. Check if the departure_time is required

	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetSeverityMessage("required", "recommended", "informational")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 5. Return nil

	return nil
}