package routes

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [routes.txt]
- Field: route_sort_order
- Presence: Optional
- Type: Non-negative integer

# Description

Orders the routes in a way which is ideal for presentation to customers. Routes with smaller route_sort_order values should be displayed first.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func RouteSortOrderValidation(route *types.Route, row int, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("route_sort_order", "routes.txt", "route_sort_order_non_negative_integer", row, services.AppMessageService)
	if rules != nil && rules.RouteSortOrder.Severity != "" {
		ctx.WithSeverity(rules.RouteSortOrder.Severity)
	}

	if route.RouteSortOrder == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("route_sort_order_validation.required", "route_sort_order_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_sort_order_validation.forbidden"))
		return
	}

	if *route.RouteSortOrder < 0 {
		ctx.AddError(ctx.GetTranslatedMessage("route_sort_order_validation.invalid"))
		return
	}
}
