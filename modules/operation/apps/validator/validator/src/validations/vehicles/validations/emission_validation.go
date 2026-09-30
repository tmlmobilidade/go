package vehicles

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes
  - File: [vehicles.txt]
  - Field: emission
  - Presence: Required
  - Type: Enum

# Description

The emission of the vehicle.

Valid options are:

  - Euro I
  - Euro II
  - Euro III
  - Euro IV
  - Euro V
  - Euro VI
  - Euro VII
  - N/A - Not applicable
*/

func EmissionValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("emission", "vehicles.txt", "vehicles_emission_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.Emission.Severity != "" {
		ctx.WithSeverity(rules.Emission.Severity)
	}

	// 1. Check if emission is required
	if vehicle.Emission == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("emission_validation.required", "emission_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if emission is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("emission_validation.forbidden"))
		return
	}

	// 3. Check if emission is valid
	validOptions := []string{"Euro I", "Euro II", "Euro III", "Euro IV", "Euro V", "Euro VI", "Euro VII", "N/A"}
	if !slices.Contains(validOptions, *vehicle.Emission) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("emission_validation.invalid", *vehicle.Emission))
		return
	}

	// 4. Validate rules
	if rules != nil && rules.Emission.Options != nil {
		if slices.Contains(*rules.Emission.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.Emission.Options, *vehicle.Emission) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("emission_validation.not_allowed", *vehicle.Emission))
			return
		}
	}
}
