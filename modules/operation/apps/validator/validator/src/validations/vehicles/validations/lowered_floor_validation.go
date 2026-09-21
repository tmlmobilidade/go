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
  - Field: lowered_floor
  - Presence: Required
  - Type: Enum

# Description

Lowered floor.

Valid options are:

  - 0 - No
  - 1 - Yes
  - 2 - Not Applicable
*/

func LoweredFloorValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("lowered_floor", "vehicles.txt", "lowered_floor_valid_enum", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.LoweredFloor.Severity != "" {
		ctx.WithSeverity(rules.LoweredFloor.Severity)
	}

	if vehicle.LoweredFloor == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("lowered_floor_validation.required"))
		return
	}

	validOptions := []int{0, 1, 2}
	if !slices.Contains(validOptions, *vehicle.LoweredFloor) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("lowered_floor_validation.invalid", strconv.Itoa(*vehicle.LoweredFloor)))
		return
	}

	// Validate rules
	if rules != nil && rules.LoweredFloor.Options != nil {
		if slices.Contains(*rules.LoweredFloor.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.LoweredFloor.Options, strconv.Itoa(*vehicle.LoweredFloor)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("lowered_floor_validation.not_allowed", strconv.Itoa(*vehicle.LoweredFloor)))
			return
		}
	}
}
