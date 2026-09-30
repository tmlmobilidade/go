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
func RouteIdValidation(route *types.Route, row int, gtfs *types.Gtfs, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("route_id", "routes.txt", "route_id_unique", row, services.AppMessageService)
	if rules != nil && rules.RouteId.Severity != "" {
		ctx.WithSeverity(rules.RouteId.Severity)
	}

	// 1. Validate route_id is present
	if route.RouteId == nil {
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

	// 3. Validate route_id is Unique ID
	rows, err := gtfs.GetRowsById("routes", *route.RouteId)
	if err == nil && len(rows) > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("route_id_validation.duplicate", *route.RouteId))
		return
	}
}
