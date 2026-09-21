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
  - Field: ramp
  - Presence: Required
  - Type: Enum


# Description

Ramp for people with reduced mobility.

Valid options are:

  - 0 - No
  - 1 - Manual ramp
  - 2 - Eletric folding system
  - 3 - Not Applicable
*/

func RampValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("ramp", "vehicles.txt", "ramp_valid_enum", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.Ramp.Severity != "" {
		ctx.WithSeverity(rules.Ramp.Severity)
	}

	if vehicle.Ramp == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("ramp_validation.required"))
		return
	}

	validOptions := []int{0, 1, 2, 3}
	if !slices.Contains(validOptions, *vehicle.Ramp) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("ramp_validation.invalid", strconv.Itoa(*vehicle.Ramp)))
		return
	}

	// Validate rules
	if rules != nil && rules.Ramp.Options != nil {
		if slices.Contains(*rules.Ramp.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.Ramp.Options, strconv.Itoa(*vehicle.Ramp)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("ramp_validation.not_allowed", strconv.Itoa(*vehicle.Ramp)))
			return
		}
	}
}
