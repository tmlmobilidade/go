package vehicles_standard

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
func VehicleTypeValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "vehicles_vehicle_type_valid_enum"
	ctx := lib.NewValidationContext("vehicle_type", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Vehicles.Field("vehicle_type")
	if err != nil {
		return err
	}
	// Presence belongs to the field check.
	if value == "" {
		return nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}
	validOptions := []int{0, 1, 2, 3, 4, 5, 6, 7, 11, 12}
	if !slices.Contains(validOptions, parsed) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}
	if rules != nil && rules.Options != nil && !slices.Contains(*rules.Options, types.ALL_OPTIONS) && !slices.Contains(*rules.Options, strconv.Itoa(parsed)) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
	}
	return nil
}
