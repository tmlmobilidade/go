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
  - Field: wheelchair_accessible
  - Presence: Required
  - Type: Enum

# Description

Accessibility status for wheelchairs of the vehicle, which follows the possible values of the wheelchair_accessible field from the trips.txt file.
Valid values are available in the official GTFS documentation.

Valid options are:

  - 0 - No accessibility information for the trip.
  - 1 - Vehicle being used on this particular trip can accommodate at least one rider in a wheelchair.
  - 2 - No riders in wheelchairs can be accommodated on this trip.

https://gtfs.org/documentation/schedule/reference/#:~:text=wheelchair_accessible
*/

func WheelchairAccessibleValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("wheelchair_accessible", "vehicles.txt", "vehicles_wheelchair_accessible_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.WheelchairAccessible.Severity != "" {
		ctx.WithSeverity(rules.WheelchairAccessible.Severity)
	}

	// 1. Check if wheelchair_accessible is required
	if vehicle.WheelchairAccessible == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("wheelchair_accessible_validation.required", "wheelchair_accessible_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if wheelchair_accessible is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("wheelchair_accessible_validation.forbidden"))
		return
	}

	// 3. Check if wheelchair_accessible is valid
	validOptions := []int{0, 1, 2}
	if !slices.Contains(validOptions, *vehicle.WheelchairAccessible) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("wheelchair_accessible_validation.invalid", strconv.Itoa(*vehicle.WheelchairAccessible)))
		return
	}

	// 4. Validate rules
	if rules != nil && rules.WheelchairAccessible.Options != nil {
		if slices.Contains(*rules.WheelchairAccessible.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.WheelchairAccessible.Options, strconv.Itoa(*vehicle.WheelchairAccessible)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("wheelchair_accessible_validation.not_allowed", strconv.Itoa(*vehicle.WheelchairAccessible)))
			return
		}
	}
}
