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
  - Field: front_display
  - Presence: Required
  - Type: Enum

# Description

External front destination display.

Valid options are:

  - 0 - No
  - 1 - Yes
  - 2 - Not Applicable
*/

func FrontDisplayValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("front_display", "vehicles.txt", "front_display_valid_enum", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.FrontDisplay.Severity != "" {
		ctx.WithSeverity(rules.FrontDisplay.Severity)
	}

	if vehicle.FrontDisplay == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("front_display_validation.required"))
		return
	}

	validOptions := []int{0, 1, 2}
	if !slices.Contains(validOptions, *vehicle.FrontDisplay) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("front_display_validation.invalid", strconv.Itoa(*vehicle.FrontDisplay)))
		return
	}

	// Validate rules
	if rules != nil && rules.FrontDisplay.Options != nil {
		if slices.Contains(*rules.FrontDisplay.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.FrontDisplay.Options, strconv.Itoa(*vehicle.FrontDisplay)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("front_display_validation.not_allowed", strconv.Itoa(*vehicle.FrontDisplay)))
			return
		}
	}
}
