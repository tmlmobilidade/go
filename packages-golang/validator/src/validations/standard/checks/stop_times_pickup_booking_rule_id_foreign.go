package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func PickupBookingRuleIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stop_times_pickup_booking_rule_id_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("pickup_booking_rule_id", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the pickup_booking_rule_id value

	value, err := db.StopTimes.Field("pickup_booking_rule_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the pickup_booking_rule_id is foreign

	if !db.BookingRules.Exists("booking_rule_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
