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
	ctx := lib.NewValidationContext("drop_off_booking_rule_id", "stop_times.txt", "drop_off_booking_rule_id_references_booking_rules_or_empty", row, services.AppMessageService)
	if rules != nil && rules.DropOffBookingRuleId.Severity != "" {
		ctx.WithSeverity(rules.DropOffBookingRuleId.Severity)
	}

	if stopTime.DropOffBookingRuleId == nil {
		if ctx.ShouldSkip() {
			return
		}
		message := ctx.GetRequiredMessage("drop_off_booking_rule_id_validation.required", "drop_off_booking_rule_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("drop_off_booking_rule_id_validation.forbidden"))
		return
	}

	// Foreign key check: must reference a valid booking_rule_id from booking_rules.txt
	if !lib.GtfsIdMapKeyExists(gtfs, "booking_rules", *stopTime.DropOffBookingRuleId) {
		ctx.AddError(ctx.GetTranslatedMessage("drop_off_booking_rule_id_validation.not_found", *stopTime.DropOffBookingRuleId))
		return
	}
}
