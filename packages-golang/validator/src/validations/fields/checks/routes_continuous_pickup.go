package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: continuous_pickup
  - Presence: Conditionally Forbidden
  - Type: Enum

# Description

Route-wide continuous boarding policy: 0 allowed, 1 or empty unavailable, 2 arrangement by phone or 3 arrangement
with the driver. Individual stop_times.txt records can override this policy.

Conditionally Forbidden:
  - Any value other than `1` or empty is Forbidden if `stop_times.start_pickup_drop_off_window` or
    `stop_times.end_pickup_drop_off_window` are defined for any trip of this route.
  - Optional otherwise.

Presence and type follow [GTFS Standard].

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#routestxt
*/
func RoutesContinuousPickupField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "routes", []string{"continuous_pickup"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the continuous_pickup value

		value, err := queries.Field(row.Source, "continuous_pickup")
		if err != nil {
			return err
		}

		//
		// 3. Check if the continuous_pickup is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
