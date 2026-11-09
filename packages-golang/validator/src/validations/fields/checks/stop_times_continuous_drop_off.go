package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: continuous_drop_off
  - Presence: Conditionally Forbidden
  - Type: Enum

# Description

Continuous alighting policy between this stop and the next: 0 allowed, 1 or empty unavailable, 2 arrangement by
phone or 3 arrangement with the driver. A populated value overrides the route policy; an empty value inherits it.

Conditionally Forbidden:
  - Any value other than `1` or empty is Forbidden if `start_pickup_drop_off_window` or `end_pickup_drop_off_window`
    are defined.
  - Optional otherwise.

Presence and type follow [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func StopTimesContinuousDropOffField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stop_times", []string{"continuous_drop_off"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the continuous_drop_off value

		value, err := queries.Field(row.Source, "continuous_drop_off")
		if err != nil {
			return err
		}

		//
		// 3. Check if the continuous_drop_off is required

		if value == "" {
			if context.ShouldSkip(row) {
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
