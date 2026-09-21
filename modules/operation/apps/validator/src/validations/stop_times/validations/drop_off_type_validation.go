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
  - Field: drop_off_type
  - Presence: Conditionally Forbidden
  - Type: Enum

# Description

Indicates drop off method.

Valid options are:

  - 0 or empty - Regularly scheduled drop off.
  - 1 - No drop off available.
  - 2 - Must phone agency to arrange drop off.
  - 3 - Must coordinate with driver to arrange drop off.

Conditionally Forbidden:

  - drop_off_type=0 forbidden if start_pickup_drop_off_window or end_pickup_drop_off_window are defined.
  - Optional otherwise.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func DropOffTypeValidation(stopTime *types.StopTime, row int, rules *types.StopTimesRules) {
	ctx := lib.NewValidationContext("drop_off_type", "stop_times.txt", "drop_off_type_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.DropOffType.Severity != "" {
		ctx.WithSeverity(rules.DropOffType.Severity)
	}

	if stopTime.DropOffType == nil {
		if ctx.ShouldSkip() {
			return
		}
		message := ctx.GetRequiredMessage("drop_off_type_validation.required", "drop_off_type_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// Validate values
	dt := *stopTime.DropOffType
	if dt < 0 || dt > 3 {
		ctx.AddError(ctx.GetTranslatedMessage("drop_off_type_validation.invalid"))
		return
	}

	// drop_off_type=0 forbidden if start_pickup_drop_off_window or end_pickup_drop_off_window are defined
	if dt == 0 && ((stopTime.StartPickupDropOffWindow != nil && *stopTime.StartPickupDropOffWindow != "") || (stopTime.EndPickupDropOffWindow != nil && *stopTime.EndPickupDropOffWindow != "")) {
		ctx.AddError(ctx.GetTranslatedMessage("drop_off_type_validation.forbidden_zero_with_window"))
		return
	}

	// Validate Rule Options
	if rules != nil && rules.DropOffType.Options != nil {
		if slices.Contains(*rules.DropOffType.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.DropOffType.Options, fmt.Sprintf("%d", dt)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("drop_off_type_validation.not_allowed", fmt.Sprintf("%d", dt)))
			return
		}
	}
}
