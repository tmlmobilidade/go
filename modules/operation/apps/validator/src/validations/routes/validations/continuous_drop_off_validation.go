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
- Field: continuous_drop_off
- Presence: Conditionally Forbidden
- Type: Enum

# Description

Indicates that the rider can board the transit vehicle at any point along the vehicle's travel path as described by shapes.txt, on every trip of the route.

Valid options are:

  - 0 - Continuous stopping drop off.
  - 1 or empty - No continuous stopping drop off.
  - 2 - Must phone agency to arrange continuous stopping drop off.
  - 3 - Must coordinate with driver to arrange continuous stopping drop off.

Values for `routes.continuous_drop_off` may be overridden by defining values in `stop_times.continuous_drop_off` for specific `stop_times` along the route.

Conditionally Forbidden:
- Any value other than `1` or `empty` is Forbidden if `stop_times.start_pickup_drop_off_window` or `stop_times.end_pickup_drop_off_window` are defined for any trip of this route.
- Optional otherwise.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func ContinuousDropOffValidation(route *types.Route, row int, gtfs *types.Gtfs, rules *types.RoutesRules, routesWithWindows map[string]bool) {
	ctx := lib.NewValidationContext("continuous_drop_off", "routes.txt", "continuous_drop_off_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.ContinuousDropOff.Severity != "" {
		ctx.WithSeverity(rules.ContinuousDropOff.Severity)
	}

	// If continuous_drop_off is "1", it's valid and we can return early
	if route.ContinuousDropOff != nil && *route.ContinuousDropOff == "1" {
		return
	}

	if route.ContinuousDropOff == nil || *route.ContinuousDropOff == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("continuous_drop_off_validation.required", "continuous_drop_off_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// Check if this route has trips with pickup/dropoff windows using pre-computed cache
	if route.RouteId != nil {
		if routesWithWindows[*route.RouteId] {
			lib.AppLogger.Accent("route.ContinuousDropOff", *route.ContinuousDropOff)
			ctx.AddError(ctx.GetTranslatedMessage("continuous_drop_off_validation.forbidden_with_window"))
			return
		}
	}

	// Validate rules
	if rules != nil && rules.ContinuousDropOff.Options != nil {
		if slices.Contains(*rules.ContinuousDropOff.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.ContinuousDropOff.Options, *route.ContinuousDropOff) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("continuous_drop_off_validation.not_allowed", map[string]any{"value": *route.ContinuousDropOff}))
			return
		}
	}
}
