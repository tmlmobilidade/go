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
  - Field: propulsion
  - Presence: Required
  - Type: Enum

# Description

The propulsion of the vehicle.

Valid options are:

  - 0 - Not applicable
  - 1 - Gasoline
  - 2 - Diesel
  - 3 - Auto LPG
  - 4 - Mixture
  - 5 - Electricity
  - 6 - Battery electric
  - 7 - Hybrid
  - 8 - Hydrogen
  - 9 - Biofuel
  - 10 - Biofuel / Biodiesel
  - 101 - Natural Gas
  - 102 - Natural Gas - CNG
  - 103 - Natural Gas - LNG
  - 104 - Aviation Fuel
  - 105 - Marine Fuel
  - 106 - Other
*/

func PropulsionValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("propulsion", "vehicles.txt", "vehicles_propulsion_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.Propulsion.Severity != "" {
		ctx.WithSeverity(rules.Propulsion.Severity)
	}

	// 1. Check if propulsion is required
	if vehicle.Propulsion == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("propulsion_validation.required", "propulsion_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if propulsion is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("propulsion_validation.forbidden"))
		return
	}

	// 3. Check if propulsion is valid
	validOptions := []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 101, 102, 103, 104, 105, 106}
	if !slices.Contains(validOptions, *vehicle.Propulsion) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("propulsion_validation.invalid", strconv.Itoa(*vehicle.Propulsion)))
		return
	}

	// 4. Validate rules
	if rules != nil && rules.Propulsion.Options != nil {
		if slices.Contains(*rules.Propulsion.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.Propulsion.Options, strconv.Itoa(*vehicle.Propulsion)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("propulsion_validation.not_allowed", strconv.Itoa(*vehicle.Propulsion)))
			return
		}
	}
}
