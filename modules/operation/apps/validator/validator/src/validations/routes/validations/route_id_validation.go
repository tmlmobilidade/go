package routes

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [routes.txt]
- Field: route_id
- Presence: Required
- Type: Unique ID

# Description

Identifies a route.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func RouteIdValidation(route *types.Route, row int, gtfs *types.Gtfs) {
	ctx := lib.NewValidationContext("route_id", "routes.txt", "route_id_unique", row, services.AppMessageService)

	if route.RouteId == nil || *route.RouteId == "" {
		ctx.AddError(ctx.GetTranslatedMessage("route_id_validation.required"))
		return
	}

	// Check if route_id is Unique ID
	rows, err := gtfs.GetRowsById("routes", *route.RouteId)
	if err == nil && len(rows) > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("route_id_validation.duplicate", *route.RouteId))
		return
	}
}
