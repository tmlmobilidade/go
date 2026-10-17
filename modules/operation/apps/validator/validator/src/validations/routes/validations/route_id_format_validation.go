package routes

import (
	"fmt"
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: route_id
  - Presence: Recommended
  - Type: Unique ID

# Description

Identifies a route, built from the line it belongs to and its presentation order.

The `route_id` must be the combination of `route_short_name` and `route_sort_order`, joined by an underscore, so that the identifier of a route can be derived from the fields that describe it.

Rows without `route_short_name` or `route_sort_order` are left alone: there is nothing to compose from, and their absence is already reported by `route_short_name_or_long_name_present` and `route_sort_order_non_negative_integer`.

# Example

The two directions of line 1001 are published as two routes, ordered by `route_sort_order`. A `routes.txt` file would contain these records:

	route_id,route_short_name,route_sort_order
	1001_0,1001,0
	1001_1,1001,1

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func RouteIdFormatValidation(route *types.Route, row int, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("route_id", "routes.txt", "route_id_composed_of_short_name_and_sort_order", row, services.AppMessageService)
	if rules != nil && rules.RouteIdFormat.Severity != "" {
		ctx.WithSeverity(rules.RouteIdFormat.Severity)
	}

	// 1. Validate route_id format is skipped
	if ctx.ShouldSkip() {
		return
	}

	// 2. Validate route_id and the fields it is composed from are present
	if route.RouteId == nil || route.RouteShortName == nil || *route.RouteShortName == "" || route.RouteSortOrder == nil {
		return
	}

	// 3. Validate route_id is route_short_name and route_sort_order joined by an underscore
	expected := fmt.Sprintf("%s_%d", *route.RouteShortName, *route.RouteSortOrder)
	if *route.RouteId != expected {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", *route.RouteId, expected, *route.RouteShortName, *route.RouteSortOrder))
		return
	}
}
