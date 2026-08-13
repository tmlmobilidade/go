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
- Field: route_short_name
- Presence: Conditionally Required
- Type: String

# Description

Short name of a route. Often a short, abstract identifier (e.g., "32", "100X", "Green") that riders use to identify a route.
Both route_short_name and route_long_name may be defined.

Conditionally Required:
  - Required if routes.route_long_name is empty.
  - Recommended if there is a brief service designation. This should be the commonly-known passenger name of the service, and should be no longer than 12 characters.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func RouteShortNameValidation(route *types.Route, row int, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("route_short_name", "routes.txt", "route_short_name_or_long_name_present", row, services.AppMessageService)
	if rules != nil && rules.RouteShortName.Severity != "" {
		ctx.WithSeverity(rules.RouteShortName.Severity)
	}

	isRouteShortNameEmpty := route.RouteShortName == nil || *route.RouteShortName == ""
	isRouteLongNameEmpty := route.RouteLongName == nil || *route.RouteLongName == ""

	if isRouteShortNameEmpty && isRouteLongNameEmpty {
		ctx.AddError(ctx.GetTranslatedMessage("route_short_name_validation.required_if_long_name_empty"))
		return
	}

	if isRouteShortNameEmpty {
		if !isRouteLongNameEmpty {
			return
		}
		ctx.AddError(ctx.GetTranslatedMessage("route_short_name_validation.required"))
		return
	}

	// Validate length
	if len(*route.RouteShortName) > 12 {
		ctx.AddWarning(ctx.GetTranslatedMessage("route_short_name_validation.too_long"))
	}

	// Validate rules
	if rules != nil && rules.RouteShortName.Options != nil {
		if slices.Contains(*rules.RouteShortName.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.RouteShortName.Options, *route.RouteShortName) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_short_name_validation.not_allowed", map[string]any{"value": *route.RouteShortName}))
			return
		}
	}
}
