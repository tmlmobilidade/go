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
- Field: continuous_pickup
- Presence: Optional
- Type: Enum

# Description

Indicates that the rider can board the transit vehicle at any point along the vehicle's travel path as described by shapes.txt, on every trip of the route.

Valid options are:

  - 0 - Continuous stopping pickup.
  - 1 or empty - No continuous stopping pickup.
  - 2 - Must phone agency to arrange continuous stopping pickup.
  - 3 - Must coordinate with driver to arrange continuous stopping pickup.

Values for `routes.continuous_pickup` may be overridden by defining values in `stop_times.continuous_pickup` for specific `stop_times` along the route.

Conditionally Forbidden:
- Any value other than `1` or `empty` is Forbidden if `stop_times.start_pickup_drop_off_window` or `stop_times.end_pickup_drop_off_window` are defined for any trip of this route.
- Optional otherwise.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func ContinuousPickupValidation(route *types.Route, row int, gtfs *types.Gtfs, rules *types.RoutesRules, routesWithWindows map[string]bool) {
	ctx := lib.NewValidationContext("continuous_pickup", "routes.txt", "routes_continuous_pickup_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.ContinuousPickup.Severity != "" {
		ctx.WithSeverity(rules.ContinuousPickup.Severity)
	}

	// 1. Validate continuous_pickup is present
	if route.ContinuousPickup == nil || *route.ContinuousPickup == "" || *route.ContinuousPickup == "1" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate continuous_pickup is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate continuous_pickup is a valid continuous_pickup
	if route.RouteId != nil {
		if routesWithWindows[*route.RouteId] {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden_with_window"))
			return
		}
	}

	// 4. Validate Rule Options
	if rules != nil && rules.ContinuousPickup.Options != nil {
		if slices.Contains(*rules.ContinuousPickup.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.ContinuousPickup.Options, *route.ContinuousPickup) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *route.ContinuousPickup))
			return
		}
	}
}
