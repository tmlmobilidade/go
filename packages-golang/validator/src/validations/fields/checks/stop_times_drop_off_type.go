package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: drop_off_type
  - Presence: Conditionally Forbidden
  - Type: Enum

# Description

Alighting policy: 0 or empty for regular service, 1 unavailable, 2 arrangement by phone or 3 arrangement with the
driver.

Conditionally Forbidden:
- `drop_off_type=0` forbidden if `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.
- Optional otherwise.

Presence and type follow [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func DropOffTypeField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stop_times", []string{"drop_off_type"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the drop_off_type value

		value, err := queries.Field(row.Source, "drop_off_type")
		if err != nil {
			return err
		}

		//
		// 3. Check if the drop_off_type is required

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
