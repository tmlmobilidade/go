package stop_times

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: pickup_booking_rule_id
  - Presence: Optional
  - Type: Foreign ID referencing booking_rules.booking_rule_id

# Description

Identifies the boarding booking rule at this stop time.

Recommended when pickup_type=2.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func PickupBookingRuleIdValidation(stopTime *types.StopTime, row int, gtfs *types.Gtfs, rules *types.StopTimesRules) {
	ctx := lib.NewValidationContext("pickup_booking_rule_id", "stop_times.txt", "pickup_booking_rule_id_references_booking_rules", row, services.AppMessageService)
	if rules != nil && rules.PickupBookingRuleId.Severity != "" {
		ctx.WithSeverity(rules.PickupBookingRuleId.Severity)
	}

	if stopTime.PickupBookingRuleId == nil {
		if ctx.ShouldSkip() {
			return
		}
		message := ctx.GetRequiredMessage("pickup_booking_rule_id_validation.required", "pickup_booking_rule_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("pickup_booking_rule_id_validation.forbidden"))
		return
	}

	// Foreign key check: must reference a valid booking_rule_id from booking_rules.txt
	if !lib.GtfsIdMapKeyExists(gtfs, "booking_rules", *stopTime.PickupBookingRuleId) {
		ctx.AddError(ctx.GetTranslatedMessage("pickup_booking_rule_id_validation.not_found", *stopTime.PickupBookingRuleId))
		return
	}

	// Validate Rule Options
	if rules != nil && rules.PickupBookingRuleId.Options != nil {
		if slices.Contains(*rules.PickupBookingRuleId.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.PickupBookingRuleId.Options, *stopTime.PickupBookingRuleId) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("pickup_booking_rule_id_validation.not_allowed", *stopTime.PickupBookingRuleId))
			return
		}
	}
}
