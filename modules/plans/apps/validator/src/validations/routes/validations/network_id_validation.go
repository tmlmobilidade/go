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
	ctx := lib.NewValidationContext("network_id", "routes.txt", "network_id_references_networks_table", row, services.AppMessageService)
	if rules != nil && rules.NetworkId.Severity != "" {
		ctx.WithSeverity(rules.NetworkId.Severity)
	}

	if route.NetworkId == nil && !ctx.ShouldIgnore() {
		message := ctx.GetRequiredMessage("network_id_validation.required", "network_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	routeNetworkCount, err := gtfs.GetTableCount("route_networks")
	// Fallback to in-memory data if database is not available
	if err != nil {
		routeNetworkCount = len(gtfs.RouteNetwork)
	}
	if routeNetworkCount > 0 && route.NetworkId != nil {
		ctx.AddError(ctx.GetTranslatedMessage("network_id_validation.forbidden_when_route_networks_exists"))
		return
	}

	// Validate rules
	if rules != nil && rules.NetworkId.Options != nil {
		if slices.Contains(*rules.NetworkId.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.NetworkId.Options, *route.NetworkId) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("network_id_validation.not_allowed", map[string]any{"value": *route.NetworkId}))
			return
		}
	}
}
