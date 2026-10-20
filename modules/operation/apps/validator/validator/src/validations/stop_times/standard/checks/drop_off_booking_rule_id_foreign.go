package stop_times_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func DropOffBookingRuleIdForeign(db *services.SQLiteContext, rules *types.StopTimesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stop_times_drop_off_booking_rule_id_foreign"

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
	// 4. Check if the drop_off_booking_rule_id is foreign

	if !db.BookingRules.Exists("booking_rule_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
		return nil
	}
	
	//
	// 5. Return success

	return nil
}