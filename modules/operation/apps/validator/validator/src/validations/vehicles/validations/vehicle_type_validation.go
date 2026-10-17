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
  - Field: vehicle_type
  - Presence: Required
  - Type: Enum

# Description

Transport mode, which follows the possible values of the route_type field from the routes.txt file.
Possible values are available in the official GTFS documentation.

Valid options are:
  - 0 - Tram, Streetcar, Light rail. Any light rail or street level system within a metropolitan area.
  - 1 - Subway, Metro. Any underground rail system within a metropolitan area.
  - 2 - Rail. Used for intercity or long-distance travel.
  - 3 - Bus. Used for short- and long-distance bus routes.
  - 4 - Ferry. Used for short- and long-distance boat service.
  - 5 - Cable tram. Used for street-level rail cars where the cable runs beneath the vehicle (e.g., cable car in San Francisco).
  - 6 - Aerial lift, suspended cable car (e.g., gondola lift, aerial tramway). Cable transport where cabins, cars, gondolas or open chairs are suspended by means of one or more cables.
  - 7 - Funicular. Any rail system designed for steep inclines.
  - 11 - Trolleybus. Electric buses that draw power from overhead wires using poles.
  - 12 - Monorail. Railway in which the track consists of a single rail or a beam.

https://gtfs.org/documentation/schedule/reference/#routestxt:~:text=and%20Far%20Rockaway).-,route_type,-Enum
*/

func VehicleTypeValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("vehicle_type", "vehicles.txt", "vehicles_vehicle_type_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.VehicleType.Severity != "" {
		ctx.WithSeverity(rules.VehicleType.Severity)
	}

	// 1. Check if vehicle_type is required
	if vehicle.VehicleType == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if vehicle_type is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Check if vehicle_type is valid
	validOptions := []int{0, 1, 2, 3, 4, 5, 6, 7, 11, 12}
	if !slices.Contains(validOptions, *vehicle.VehicleType) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", strconv.Itoa(*vehicle.VehicleType)))
		return
	}

	// 4. Validate rules
	if rules != nil && rules.VehicleType.Options != nil {
		if slices.Contains(*rules.VehicleType.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.VehicleType.Options, strconv.Itoa(*vehicle.VehicleType)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", strconv.Itoa(*vehicle.VehicleType)))
			return
		}
	}
}
