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
  - Field: side_display
  - Presence: Required
  - Type: Enum

# Description

External right side destination panel.

Valid options are:

  - 0 - No
  - 1 - Yes
  - 2 - Not Applicable
*/

func SideDisplayValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("side_display", "vehicles.txt", "side_display_valid_enum", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.SideDisplay.Severity != "" {
		ctx.WithSeverity(rules.SideDisplay.Severity)
	}

	if vehicle.SideDisplay == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("side_display_validation.required"))
		return
	}

	validOptions := []int{0, 1, 2}
	if !slices.Contains(validOptions, *vehicle.SideDisplay) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("side_display_validation.invalid", strconv.Itoa(*vehicle.SideDisplay)))
		return
	}

	// Validate rules
	if rules != nil && rules.SideDisplay.Options != nil {
		if slices.Contains(*rules.SideDisplay.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.SideDisplay.Options, strconv.Itoa(*vehicle.SideDisplay)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("side_display_validation.not_allowed", strconv.Itoa(*vehicle.SideDisplay)))
			return
		}
	}
}
