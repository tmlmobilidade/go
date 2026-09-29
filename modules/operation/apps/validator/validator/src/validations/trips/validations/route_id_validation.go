package trips

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: route_id
  - Presence: Required
  - Type: Foreign Key referencing routes.route_id

# Description

Identifies a route.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func RouteIdValidation(trip *types.Trip, row int, gtfs *types.Gtfs, routeRowsCache map[string][]int, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("route_id", "trips.txt", "trips_route_id_references_routes_table", row, services.AppMessageService)
	if rules != nil && rules.RouteId.Severity != "" {
		ctx.WithSeverity(rules.RouteId.Severity)
	}

	// 1. Validate route_id is present
	if trip.RouteId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("route_id_validation.required", "route_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate route_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_id_validation.forbidden"))
		return
	}

	// 3. Validate route_id is Foreign Key referencing routes.route_id (use cache to avoid repeated queries)
	rows, err := gtfs.GetCachedRowsById(routeRowsCache, "routes", *trip.RouteId)
	if err != nil || len(rows) == 0 {
		ctx.AddError(ctx.GetTranslatedMessage("route_id_validation.not_found", *trip.RouteId))
	}
}
