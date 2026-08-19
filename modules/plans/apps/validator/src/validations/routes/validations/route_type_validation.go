package routes

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes

- File: [routes.txt]
- Field: route_type
- Presence: Required
- Type: Enum

# Description

Indicates the type of transportation used on a route.

Valid options are:

  - 0: Tram, Streetcar, Light rail. Any light rail or street level system within a metropolitan area.
  - 1: Subway, Metro. Any underground rail system within a metropolitan area.
  - 2: Rail. Used for intercity or long-distance travel.
  - 3: Bus. Used for short- and long-distance bus routes.
  - 4: Ferry. Used for short- and long-distance boat service.
  - 5: Cable tram. Used for street-level rail cars where the cable runs beneath the vehicle (e.g., cable car in San Francisco).
  - 6: Aerial lift, suspended cable car (e.g., gondola lift, aerial tramway). Cable transport where cabins, cars, gondolas or open chairs are suspended by means of one or more cables.
  - 7: Funicular. Any rail system designed for steep inclines.
  - 11: Trolleybus. Electric buses that draw power from overhead wires using poles.
  - 12: Monorail. Railway in which the track consists of a single rail or a beam.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func RouteTypeValidation(route *types.Route, row int, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("route_type", "routes.txt", "route_type_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.RouteType.Severity != "" {
		ctx.WithSeverity(rules.RouteType.Severity)
	}

	validTypes := map[int]struct{}{
		0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 11: {}, 12: {},
	}

	if route.RouteType == nil {
		ctx.AddError(ctx.GetTranslatedMessage("route_type_validation.required"))
		return
	}

	if _, ok := validTypes[*route.RouteType]; !ok {
		ctx.AddError(ctx.GetTranslatedMessage("route_type_validation.invalid"))
		return
	}

	// Validate rules
	if rules != nil && rules.RouteType.Options != nil {
		if slices.Contains(*rules.RouteType.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.RouteType.Options, strconv.Itoa(*route.RouteType)) {
			ctx.AddError(ctx.GetTranslatedMessage("route_type_validation.not_allowed", map[string]any{"value": *route.RouteType}))
			return
		}
	}
}
