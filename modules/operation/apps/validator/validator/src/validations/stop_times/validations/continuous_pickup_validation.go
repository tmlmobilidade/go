package stop_times

import (
	"fmt"
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: continuous_pickup
  - Presence: Conditionally Forbidden
  - Type: Enum

# Description

Indicates that the rider can board the transit vehicle at any point along the vehicle's travel path as described by shapes.txt, from this stop_time to the next stop_time in the trip's stop_sequence.

Valid options are:

  - 0 - Continuous stopping pickup.
  - 1 or empty - No continuous stopping pickup.
  - 2 - Must phone agency to arrange continuous stopping pickup.
  - 3 - Must coordinate with driver to arrange continuous stopping pickup.

If this field is populated, it overrides any continuous pickup behavior defined in routes.txt. If this field is empty, the stop_time inherits any continuous pickup behavior defined in routes.txt.

Conditionally Forbidden:

  - Any value other than 1 or empty is Forbidden if start_pickup_drop_off_window or end_pickup_drop_off_window are defined.
  - Optional otherwise.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func ContinuousPickupValidation(stopTime *types.StopTime, row int, rules *types.StopTimesRules) {
	ctx := lib.NewValidationContext("continuous_pickup", "stop_times.txt", "stop_times_continuous_pickup_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.ContinuousPickup.Severity != "" {
		ctx.WithSeverity(rules.ContinuousPickup.Severity)
	}

	// 1. Check if continuous_pickup is present
	if stopTime.ContinuousPickup == nil {
		if ctx.ShouldSkip() {
			return
		}
		message := ctx.GetRequiredMessage("continuous_pickup_validation.required", "continuous_pickup_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if continuous_pickup is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("continuous_pickup_validation.forbidden"))
		return
	}

	// 3. Check if continuous_pickup is between 0 and 3
	cp := *stopTime.ContinuousPickup
	if cp < 0 || cp > 3 {
		ctx.AddError(ctx.GetTranslatedMessage("continuous_pickup_validation.invalid"))
		return
	}

	// 4. Check if continuous_pickup is forbidden with a window: any value other than 1 or empty if start/end_pickup_drop_off_window are defined
	if ((stopTime.StartPickupDropOffWindow != nil && *stopTime.StartPickupDropOffWindow != "") || (stopTime.EndPickupDropOffWindow != nil && *stopTime.EndPickupDropOffWindow != "")) && (cp != 1) {
		ctx.AddError(ctx.GetTranslatedMessage("continuous_pickup_validation.forbidden_with_window"))
		return
	}

	// 5. Validate rule options
	if rules != nil && rules.ContinuousPickup.Options != nil {
		if slices.Contains(*rules.ContinuousPickup.Options, types.ALL_OPTIONS) {
			return
		}

		if slices.Contains(*rules.ContinuousPickup.Options, fmt.Sprintf("%d", cp)) {
			return
		}

		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("continuous_pickup_validation.not_allowed", fmt.Sprintf("%d", cp)))
		return
	}
}
