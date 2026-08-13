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
- Field: route_desc
- Presence: Optional
- Type: String

# Description

Description of a route that provides useful, quality information. Should not be a duplicate of route_short_name or route_long_name.

# Example

"A" trains operate between Inwood-207 St, Manhattan and Far Rockaway-Mott Avenue, Queens at all times. Also from about 6AM until about midnight, additional "A" trains operate between Inwood-207 St and Lefferts Boulevard (trains typically alternate between Lefferts Blvd and Far Rockaway).

Conditionally Required:
  - Required if routes.route_short_name is empty.
  - Optional otherwise.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func RouteDescValidation(route *types.Route, row int, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("route_desc", "routes.txt", "route_desc_per_severity_and_content_rules", row, services.AppMessageService)
	if rules != nil && rules.RouteDesc.Severity != "" {
		ctx.WithSeverity(rules.RouteDesc.Severity)
	}

	// Check if route_short_name is empty - if so, route_desc is required
	isRouteShortNameEmpty := route.RouteShortName == nil || *route.RouteShortName == ""
	isRouteDescEmpty := route.RouteDesc == nil || *route.RouteDesc == ""

	// Conditionally Required: Required if routes.route_short_name is empty
	if isRouteShortNameEmpty && isRouteDescEmpty {
		ctx.AddError(ctx.GetTranslatedMessage("route_desc_validation.required"))
		return
	}

	// If route_desc is empty but route_short_name is present, it's optional - no error
	if isRouteDescEmpty {
		if !isRouteShortNameEmpty {
			return
		}
		ctx.AddError(ctx.GetTranslatedMessage("route_desc_validation.required"))
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_desc_validation.forbidden"))
		return
	}

	if route.RouteShortName != nil && *route.RouteDesc == *route.RouteShortName {
		ctx.AddWarning(ctx.GetTranslatedMessage("route_desc_validation.duplicate_short_name"))
	}
	if route.RouteLongName != nil && *route.RouteDesc == *route.RouteLongName {
		ctx.AddWarning(ctx.GetTranslatedMessage("route_desc_validation.duplicate_long_name"))
	}

	// Validate rules
	if rules != nil && rules.RouteDesc.Options != nil {
		if slices.Contains(*rules.RouteDesc.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.RouteDesc.Options, *route.RouteDesc) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_desc_validation.not_allowed", map[string]any{"value": *route.RouteDesc}))
			return
		}
	}
}
