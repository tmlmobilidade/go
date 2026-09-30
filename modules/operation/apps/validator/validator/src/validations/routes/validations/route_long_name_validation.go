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
- Presence: Required
- Type: String

# Description

Full name of a route. This name is generally more descriptive than the route_short_name and often includes the route's destination or stop.

Both route_short_name and route_long_name may be defined.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func RouteLongNameValidation(route *types.Route, row int, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("route_long_name", "routes.txt", "route_long_name_or_short_name_present", row, services.AppMessageService)
	if rules != nil && rules.RouteLongName.Severity != "" {
		ctx.WithSeverity(rules.RouteLongName.Severity)
	}

	// 1. Validate route_long_name is present
	if route.RouteLongName == nil || *route.RouteLongName == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("route_long_name_validation.required", "route_long_name_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate route_long_name is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_long_name_validation.forbidden"))
		return
	}

	// 3. Validate Rule Options
	if rules != nil && rules.RouteLongName.Options != nil {
		if slices.Contains(*rules.RouteLongName.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.RouteLongName.Options, *route.RouteLongName) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_long_name_validation.not_allowed", *route.RouteLongName))
			return
		}
	}
}
