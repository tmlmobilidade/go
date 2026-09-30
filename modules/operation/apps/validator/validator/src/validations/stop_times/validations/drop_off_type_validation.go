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
  - Presence: Required
  - Type: Enum

# Description

Indicates drop off method.

Valid options are:

  - 0 - Regularly scheduled drop off.
  - 1 - No drop off available.
  - 2 - Must phone agency to arrange drop off.
  - 3 - Must coordinate with driver to arrange drop off.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func DropOffTypeValidation(stopTime *types.StopTime, row int, rules *types.StopTimesRules) {
	ctx := lib.NewValidationContext("drop_off_type", "stop_times.txt", "stop_times_drop_off_type_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.DropOffType.Severity != "" {
		ctx.WithSeverity(rules.DropOffType.Severity)
	}

	// 1. Check if drop_off_type is present
	if stopTime.DropOffType == nil {
		if ctx.ShouldSkip() {
			return
		}
		message := ctx.GetRequiredMessage("drop_off_type_validation.required", "drop_off_type_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if drop_off_type is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("drop_off_type_validation.forbidden"))
		return
	}

	// 3. Check if drop_off_type is between 0 and 3
	dt := *stopTime.DropOffType
	if dt < 0 || dt > 3 {
		ctx.AddError(ctx.GetTranslatedMessage("drop_off_type_validation.invalid"))
		return
	}

	// 4. Check if drop_off_type is forbidden with a window: 0 is forbidden if start_pickup_drop_off_window or end_pickup_drop_off_window are defined
	if dt == 0 && ((stopTime.StartPickupDropOffWindow != nil && *stopTime.StartPickupDropOffWindow != "") || (stopTime.EndPickupDropOffWindow != nil && *stopTime.EndPickupDropOffWindow != "")) {
		ctx.AddError(ctx.GetTranslatedMessage("drop_off_type_validation.forbidden_pickup_dropoff"))
		return
	}

	// 5. Validate rule options
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
