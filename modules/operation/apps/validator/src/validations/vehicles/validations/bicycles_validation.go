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
  - Field: bicycles
  - Presence: Required
  - Type: Enum

# Description

Permission to transport non-folding bicycles (folding bicycles are always allowed).

Valid options are:

  - 0 - No
  - 1 - Yes
*/
func BicyclesValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("bicycles", "vehicles.txt", "bicycles_rack_count_non_negative", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.Bicycles.Severity != "" {
		ctx.WithSeverity(rules.Bicycles.Severity)
	}

	if vehicle.Bicycles == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("bicycles_validation.required"))
		return
	}

	validOptions := []int{0, 1}
	if !slices.Contains(validOptions, *vehicle.Bicycles) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("bicycles_validation.invalid", strconv.Itoa(*vehicle.Bicycles)))
		return
	}

	// Validate rules
	if rules != nil && rules.Bicycles.Options != nil {
		if slices.Contains(*rules.Bicycles.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.Bicycles.Options, strconv.Itoa(*vehicle.Bicycles)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("bicycles_validation.not_allowed", strconv.Itoa(*vehicle.Bicycles)))
			return
		}
	}
}
