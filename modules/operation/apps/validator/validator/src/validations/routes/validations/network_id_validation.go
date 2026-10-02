package routes

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

- File: [routes.txt]
- Field: network_id
- Presence: Conditionally Forbidden
- Type: ID

# Description

Identifies a group of routes. Multiple rows in [routes.txt] may have the same network_id.

Conditionally Forbidden:
- Forbidden if the [route_networks.txt] file exists.
- Optional otherwise.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
[route_networks.txt]: https://gtfs.org/schedule/reference/#routenetworkstxt
*/
func NetworkIdValidation(route *types.Route, row int, gtfs *types.Gtfs, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("network_id", "routes.txt", "routes_network_id_references_networks_table", row, services.AppMessageService)
	if rules != nil && rules.NetworkId.Severity != "" {
		ctx.WithSeverity(rules.NetworkId.Severity)
	}

	// 1. Validate network_id is present
	if route.NetworkId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate network_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate network_id is valid
	routeNetworkCount, err := gtfs.GetTableCount("route_networks")
	// Fallback to in-memory data if database is not available
	if err != nil {
		routeNetworkCount = len(gtfs.RouteNetwork)
	}
	if routeNetworkCount > 0 && route.NetworkId != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden_when_route_networks_exists", *route.NetworkId))
		return
	}

	// 4. Validate Rule Options
	if rules != nil && rules.NetworkId.Options != nil {
		if slices.Contains(*rules.NetworkId.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.NetworkId.Options, *route.NetworkId) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *route.NetworkId))
			return
		}
	}
}
