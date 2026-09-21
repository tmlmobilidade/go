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
- Field: route_long_name
- Presence: Conditionally Required
- Type: String

# Description

Full name of a route. This name is generally more descriptive than the route_short_name and often includes the route's destination or stop.

Both route_short_name and route_long_name may be defined.

Conditionally Required:
  - Required if routes.route_short_name is empty.
  - Optional otherwise.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func RouteLongNameValidation(route *types.Route, row int, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("route_long_name", "routes.txt", "route_long_name_or_short_name_present", row, services.AppMessageService)
	if rules != nil && rules.RouteLongName.Severity != "" {
		ctx.WithSeverity(rules.RouteLongName.Severity)
	}

	isRouteLongNameEmpty := route.RouteLongName == nil || *route.RouteLongName == ""
	isRouteShortNameEmpty := route.RouteShortName == nil || *route.RouteShortName == ""

	if isRouteLongNameEmpty && isRouteShortNameEmpty {
		ctx.AddError(ctx.GetTranslatedMessage("route_long_name_validation.required_if_short_name_empty"))
		return
	}

	if isRouteLongNameEmpty {
		if !isRouteShortNameEmpty {
			return
		}
		ctx.AddError(ctx.GetTranslatedMessage("route_long_name_validation.required"))
		return
	}

	// Validate rules
	if rules != nil && rules.RouteLongName.Options != nil {
		if slices.Contains(*rules.RouteLongName.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.RouteLongName.Options, *route.RouteLongName) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_long_name_validation.not_allowed", map[string]any{"value": *route.RouteLongName}))
			return
		}
	}
}
