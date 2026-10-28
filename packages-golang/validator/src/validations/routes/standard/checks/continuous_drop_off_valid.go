package routes_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

/*
# Attributes

- File: [routes.txt]
- Field: continuous_drop_off
- Presence: Optional
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
func ContinuousDropOffValid(db *services.SQLiteContext, rules *types.RuleContext, routesWithWindows map[string]bool) error {
	//
	// 1. Get the rule

	const ruleID = "routes_continuous_drop_off_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("continuous_drop_off", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the route values

	values, err := db.Routes.Fields("continuous_drop_off", "route_id")
	if err != nil {
		return err
	}
	value := values["continuous_drop_off"]

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
