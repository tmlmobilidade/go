package stop_times

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: drop_off_booking_rule_id
  - Presence: Optional
  - Type: Foreign ID referencing booking_rules.booking_rule_id

# Description

Identifies the alighting booking rule at this stop time.

Recommended when drop_off_type=2.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func DropOffBookingRuleIdValidation(stopTime *types.StopTime, row int, gtfs *types.Gtfs, rules *types.StopTimesRules) {
	ctx := lib.NewValidationContext("drop_off_booking_rule_id", "stop_times.txt", "stop_times_drop_off_booking_rule_id_references_booking_rules_or_empty", row, services.AppMessageService)
	if rules != nil && rules.DropOffBookingRuleId.Severity != "" {
		ctx.WithSeverity(rules.DropOffBookingRuleId.Severity)
	}

	// 1. Validate drop_off_booking_rule_id is present
	if stopTime.DropOffBookingRuleId == nil {
		if ctx.ShouldSkip() {
			return
		}
		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate drop_off_booking_rule_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate drop_off_booking_rule_id is Foreign Key referencing booking_rules.booking_rule_id
	if !lib.GtfsIdMapKeyExists(gtfs, "booking_rules", *stopTime.DropOffBookingRuleId) {
		ctx.AddError(ctx.GetTranslatedMessage("not_found", *stopTime.DropOffBookingRuleId))
		return
	}
}
