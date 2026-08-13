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
  - Field: static_information
  - Presence: Required
  - Type: Enum

# Description

Posters and fixed signage.

Valid options are:

  - 0 - No
  - 1 - Yes
*/

func StaticInformationValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("static_information", "vehicles.txt", "static_information_valid_enum", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.StaticInformation.Severity != "" {
		ctx.WithSeverity(rules.StaticInformation.Severity)
	}

	if vehicle.StaticInformation == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("static_information_validation.required"))
		return
	}

	validOptions := []int{0, 1}
	if !slices.Contains(validOptions, *vehicle.StaticInformation) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("static_information_validation.invalid", strconv.Itoa(*vehicle.StaticInformation)))
		return
	}

	// Validate rules
	if rules != nil && rules.StaticInformation.Options != nil {
		if slices.Contains(*rules.StaticInformation.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.StaticInformation.Options, strconv.Itoa(*vehicle.StaticInformation)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("static_information_validation.not_allowed", strconv.Itoa(*vehicle.StaticInformation)))
			return
		}
	}
}
