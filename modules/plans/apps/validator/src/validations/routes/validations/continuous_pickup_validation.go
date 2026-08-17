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
- Presence: Conditionally Forbidden
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
	ctx := lib.NewValidationContext("continuous_pickup", "routes.txt", "continuous_pickup_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.ContinuousPickup.Severity != "" {
		ctx.WithSeverity(rules.ContinuousPickup.Severity)
	}

	// If continuous_pickup is "1", it's valid and we can return early
	if route.ContinuousPickup != nil && *route.ContinuousPickup == "1" {
		return
	}

	if route.ContinuousPickup == nil || *route.ContinuousPickup == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("continuous_pickup_validation.required", "continuous_pickup_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// Check if this route has trips with pickup/dropoff windows using pre-computed cache
	if route.RouteId != nil {
		if routesWithWindows[*route.RouteId] {
			lib.AppLogger.Accent("route.ContinuousPickup", *route.ContinuousPickup)
			ctx.AddError(ctx.GetTranslatedMessage("continuous_pickup_validation.forbidden_with_window"))
			return
		}
	}

	// Validate rules
	if rules != nil && rules.ContinuousPickup.Options != nil {
		if slices.Contains(*rules.ContinuousPickup.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.ContinuousPickup.Options, *route.ContinuousPickup) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("continuous_pickup_validation.not_allowed", map[string]any{"value": *route.ContinuousPickup}))
			return
		}
	}
}
