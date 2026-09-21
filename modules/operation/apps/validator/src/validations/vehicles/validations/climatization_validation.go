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
  - Field: climatization
  - Presence: Required
  - Type: Enum

# Description

Climatization.

Valid options are:

  - 0 - No
  - 1 - Yes
*/

func ClimatizationValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("climatization", "vehicles.txt", "climatization_valid_enum", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.Climatization.Severity != "" {
		ctx.WithSeverity(rules.Climatization.Severity)
	}

	if vehicle.Climatization == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("climatization_validation.required"))
		return
	}

	validOptions := []int{0, 1}
	if !slices.Contains(validOptions, *vehicle.Climatization) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("climatization_validation.invalid", strconv.Itoa(*vehicle.Climatization)))
		return
	}

	// Validate rules
	if rules != nil && rules.Climatization.Options != nil {
		if slices.Contains(*rules.Climatization.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.Climatization.Options, strconv.Itoa(*vehicle.Climatization)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("climatization_validation.not_allowed", strconv.Itoa(*vehicle.Climatization)))
			return
		}
	}
}
