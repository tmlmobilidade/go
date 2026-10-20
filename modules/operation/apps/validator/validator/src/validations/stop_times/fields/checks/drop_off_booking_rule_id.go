package stop_times_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func DropOffBookingRuleIdField(db *services.SQLiteContext, rules *types.StopTimesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stop_times_drop_off_booking_rule_id_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("drop_off_booking_rule_id", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the drop_off_booking_rule_id value

	value, err := db.StopTimes.Field("drop_off_booking_rule_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the drop_off_booking_rule_id is required

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