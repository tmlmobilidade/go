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

	// 1. Validate route_desc is present
	// Conditionally Required: required only when route_short_name is empty
	if route.RouteDesc == nil || *route.RouteDesc == "" {
		if route.RouteShortName != nil {
			return
		}

		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("route_desc_validation.required", "route_desc_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate route_desc is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_desc_validation.forbidden"))
		return
	}

	// 3. Validate route_desc is a duplicate of route_short_name or route_long_name
	if route.RouteShortName != nil && *route.RouteDesc == *route.RouteShortName {
		ctx.AddWarning(ctx.GetTranslatedMessage("route_desc_validation.duplicate_short_name"))
	}
	if route.RouteLongName != nil && *route.RouteDesc == *route.RouteLongName {
		ctx.AddWarning(ctx.GetTranslatedMessage("route_desc_validation.duplicate_long_name"))
	}

	// 4. Validate Rule Options
	if rules != nil && rules.RouteDesc.Options != nil {
		if slices.Contains(*rules.RouteDesc.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.RouteDesc.Options, *route.RouteDesc) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_desc_validation.not_allowed", *route.RouteDesc))
			return
		}
	}
}
