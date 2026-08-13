package vehicles

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes
  - File: [vehicles.txt]
  - Field: rear_display
  - Presence: Required
  - Type: Enum

# Description

External rear destination display.

Valid options are:

  - 0 - No
  - 1 - Yes
  - 2 - Not Applicable
*/

func RearDisplayValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("rear_display", "vehicles.txt", "rear_display_valid_enum", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.RearDisplay.Severity != "" {
		ctx.WithSeverity(rules.RearDisplay.Severity)
	}

	if vehicle.RearDisplay == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("rear_display_validation.required"))
		return
	}

	validOptions := []int{0, 1, 2}
	if !slices.Contains(validOptions, *vehicle.RearDisplay) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("rear_display_validation.invalid", strconv.Itoa(*vehicle.RearDisplay)))
		return
	}

	// Validate rules
	if rules != nil && rules.RearDisplay.Options != nil {
		if slices.Contains(*rules.RearDisplay.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.RearDisplay.Options, strconv.Itoa(*vehicle.RearDisplay)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("rear_display_validation.not_allowed", strconv.Itoa(*vehicle.RearDisplay)))
			return
		}
	}
}
