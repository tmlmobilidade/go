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
  - Field: pickup_type
  - Presence: Conditionally Required
  - Type: Enum

# Description

Indicates pickup method.

Valid options are:

  - 0 or empty - Regularly scheduled pickup.
  - 1 - No pickup available.
  - 2 - Must phone agency to arrange pickup.
  - 3 - Must coordinate with driver to arrange pickup.

Conditionally Forbidden:

  - pickup_type=0 is forbidden if start_pickup_drop_off_window or end_pickup_drop_off_window are defined.
  - pickup_type=3 is forbidden if start_pickup_drop_off_window or end_pickup_drop_off_window are defined.
  - pickup_type is optional otherwise.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func PickupTypeValidation(stopTime *types.StopTime, row int, rules *types.StopTimesRules) {
	ctx := lib.NewValidationContext("pickup_type", "stop_times.txt", "pickup_type_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.PickupType.Severity != "" {
		ctx.WithSeverity(rules.PickupType.Severity)
	}

	// Validate presence
	if stopTime.PickupType == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("pickup_type_validation.required", "pickup_type_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// Validate values
	pt := *stopTime.PickupType
	if pt < 0 || pt > 3 {
		ctx.AddError(ctx.GetTranslatedMessage("pickup_type_validation.invalid"))
		return
	}

	// pickup_type=0 or 3 forbidden if start_pickup_drop_off_window or end_pickup_drop_off_window are defined
	if (pt == 0 || pt == 3) && ((stopTime.StartPickupDropOffWindow != nil && *stopTime.StartPickupDropOffWindow != "") || (stopTime.EndPickupDropOffWindow != nil && *stopTime.EndPickupDropOffWindow != "")) {
		ctx.AddError(ctx.GetTranslatedMessage("pickup_type_validation.forbidden_with_window"))
		return
	}

	// Validate Rule Options
	if rules != nil && rules.PickupType.Options != nil {
		if slices.Contains(*rules.PickupType.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.PickupType.Options, fmt.Sprintf("%d", pt)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("pickup_type_validation.not_allowed", fmt.Sprintf("%d", pt)))
			return
		}
	}
}
