package routes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
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
func ContinuousPickupValid(db *services.SQLiteContext, rules *types.RuleContext, routesWithWindows map[string]bool) error {
	//
	// 1. Get the rule

	const ruleID = "routes_continuous_pickup_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("continuous_pickup", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the route values

	values, err := db.Routes.Fields("continuous_pickup", "route_id")
	if err != nil {
		return err
	}
	value := values["continuous_pickup"]

	//
	// 4. Check whether continuous service is enabled

	if value == "" || value == "1" {
		if ctx.ShouldSkip() {
			return nil
		}
		ctx.AddMessageWithSeverity(ctx.GetRequiredMessage("required", "recommended"))
		return nil
	}

	//
	// 5. Check whether continuous service is forbidden with windows

	if routesWithWindows[values["route_id"]] {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden_with_window"))
		return nil
	}

	//
	// 6. Return success

	return nil
}
