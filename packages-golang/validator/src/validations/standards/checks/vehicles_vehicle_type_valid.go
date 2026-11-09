package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	variables "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
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
func VehicleTypeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "vehicles", []string{"vehicle_type"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}
		config := &rowCtx.Config

		value, err := queries.Field(rowCtx.Source, "vehicle_type")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty vehicle_type values

		// Presence belongs to the field check.
		if value == "" {
			return nil
		}

		//
		// 3. Convert the vehicle_type to an integer

		parsed, err := strconv.Atoi(value)
		if err != nil {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Get the valid vehicle_type options

		validOptions := []int{0, 1, 2, 3, 4, 5, 6, 7, 11, 12}

		//
		// 5. Check if the vehicle_type is a valid option

		if !slices.Contains(validOptions, parsed) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 6. Check the configured vehicle_type options

		if config.Options != nil && !slices.Contains(*config.Options, variables.AllRuleOptions) && !slices.Contains(*config.Options, strconv.Itoa(parsed)) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_allowed", value))
		}

		//
		// 7. Return success

		return nil
	})
}
