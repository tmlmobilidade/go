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
  - Field: continuous_drop_off
  - Presence: Conditionally Forbidden
  - Type: Enum

# Description

Indicates that the rider can alight from the transit vehicle at any point along the vehicle's travel path as described by shapes.txt, from this stop_time to the next stop_time in the trip's stop_sequence.

Valid options are:

  - 0 - Continuous stopping drop off.
  - 1 or empty - No continuous stopping drop off.
  - 2 - Must phone agency to arrange continuous stopping drop off.
  - 3 - Must coordinate with driver to arrange continuous stopping drop off.

If this field is populated, it overrides any continuous drop-off behavior defined in routes.txt. If this field is empty, the stop_time inherits any continuous drop-off behavior defined in routes.txt.

Conditionally Forbidden:

  - Any value other than 1 or empty is Forbidden if start_pickup_drop_off_window or end_pickup_drop_off_window are defined.
  - Optional otherwise.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func ContinuousDropOffValidation(stopTime *types.StopTime, row int, rules *types.StopTimesRules) {
	ctx := lib.NewValidationContext("continuous_drop_off", "stop_times.txt", "stop_times_continuous_drop_off_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.ContinuousDropOff.Severity != "" {
		ctx.WithSeverity(rules.ContinuousDropOff.Severity)
	}

	// If not present, it's optional unless severity is set
	if stopTime.ContinuousDropOff == nil {
		if ctx.ShouldSkip() {
			return
		}
		message := ctx.GetRequiredMessage("continuous_drop_off_validation.required", "continuous_drop_off_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	cd := *stopTime.ContinuousDropOff
	if cd < 0 || cd > 3 {
		ctx.AddError(ctx.GetTranslatedMessage("continuous_drop_off_validation.invalid"))
		return
	}

	// Forbidden: Any value other than 1 or empty if start/end_pickup_drop_off_window are defined
	if ((stopTime.StartPickupDropOffWindow != nil && *stopTime.StartPickupDropOffWindow != "") || (stopTime.EndPickupDropOffWindow != nil && *stopTime.EndPickupDropOffWindow != "")) && (cd != 1) {
		ctx.AddError(ctx.GetTranslatedMessage("continuous_drop_off_validation.forbidden_with_window"))
		return
	}

	// Validate Rule Options
	if rules != nil && rules.ContinuousDropOff.Options != nil {
		if slices.Contains(*rules.ContinuousDropOff.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.ContinuousDropOff.Options, fmt.Sprintf("%d", cd)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("continuous_drop_off_validation.not_allowed", fmt.Sprintf("%d", cd)))
			return
		}
	}
}
