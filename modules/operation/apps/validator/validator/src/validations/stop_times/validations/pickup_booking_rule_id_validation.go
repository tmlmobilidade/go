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
	ctx := lib.NewValidationContext("pickup_booking_rule_id", "stop_times.txt", "stop_times_pickup_booking_rule_id_references_booking_rules", row, services.AppMessageService)
	if rules != nil && rules.PickupBookingRuleId.Severity != "" {
		ctx.WithSeverity(rules.PickupBookingRuleId.Severity)
	}

	// 1. Check if pickup_booking_rule_id is present
	if stopTime.PickupBookingRuleId == nil {
		if ctx.ShouldSkip() {
			return
		}
		message := ctx.GetRequiredMessage("pickup_booking_rule_id_validation.required", "pickup_booking_rule_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if pickup_booking_rule_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("pickup_booking_rule_id_validation.forbidden"))
		return
	}

	// 3. Check if pickup_booking_rule_id is Foreign Key referencing booking_rules.booking_rule_id
	if !lib.GtfsIdMapKeyExists(gtfs, "booking_rules", *stopTime.PickupBookingRuleId) {
		ctx.AddError(ctx.GetTranslatedMessage("pickup_booking_rule_id_validation.not_found", *stopTime.PickupBookingRuleId))
		return
	}

	// 4. Validate rule options
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
