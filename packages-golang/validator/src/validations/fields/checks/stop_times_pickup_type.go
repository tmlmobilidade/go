package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: pickup_type
  - Presence: Conditionally Forbidden
  - Type: Enum

# Description

Boarding policy: 0 or empty for regular service, 1 unavailable, 2 arrangement by phone or 3 arrangement with the
driver.

Conditionally Forbidden:
- `pickup_type=0` forbidden if `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.
- `pickup_type=3` forbidden if `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.
- Optional otherwise.

Presence and type follow [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func PickupTypeField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stop_times", []string{"pickup_type"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the pickup_type value

		value, err := queries.Field(row.Source, "pickup_type")
		if err != nil {
			return err
		}

		//
		// 3. Check if the pickup_type is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			message := context.GetSeverityMessage(row, "required", "recommended", "informational")
			context.AddMessage(row, message)
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
