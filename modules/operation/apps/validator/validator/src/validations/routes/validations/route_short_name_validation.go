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
- Presence: Required
- Type: String

# Description

Short name of a route. Often a short, abstract identifier (e.g., "32", "100X", "Green") that riders use to identify a route.
Both route_short_name and route_long_name may be defined.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func RouteShortNameValidation(route *types.Route, row int, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("route_short_name", "routes.txt", "route_short_name_or_long_name_present", row, services.AppMessageService)
	if rules != nil && rules.RouteShortName.Severity != "" {
		ctx.WithSeverity(rules.RouteShortName.Severity)
	}

	// route_short_name is required
	if route.RouteShortName == nil || *route.RouteShortName == "" {
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
