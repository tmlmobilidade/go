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
  - Field: wheelchair
  - Presence: Required
  - Type: Enum

# Description

Wheelchair accessibility.

Valid options are:

  - 0 - No
  - 1 - Yes
*/

func WheelchairValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("wheelchair", "vehicles.txt", "wheelchair_spots_valid_enum", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.Wheelchair.Severity != "" {
		ctx.WithSeverity(rules.Wheelchair.Severity)
	}

	if vehicle.Wheelchair == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("wheelchair_validation.required"))
		return
	}

	validOptions := []int{0, 1}
	if !slices.Contains(validOptions, *vehicle.Wheelchair) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("wheelchair_validation.invalid", strconv.Itoa(*vehicle.Wheelchair)))
		return
	}

	// Validate rules
	if rules != nil && rules.Wheelchair.Options != nil {
		if slices.Contains(*rules.Wheelchair.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.Wheelchair.Options, strconv.Itoa(*vehicle.Wheelchair)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("wheelchair_validation.not_allowed", strconv.Itoa(*vehicle.Wheelchair)))
			return
		}
	}
}
