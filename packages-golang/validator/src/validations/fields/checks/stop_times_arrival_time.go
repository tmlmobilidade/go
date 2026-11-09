package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: arrival_time
  - Presence: Conditionally Required
  - Type: Time

# Description

Arrival time at the stop for this trip, using agency.agency_timezone rather than stops.stop_timezone. Use values
beyond 24:00:00 after midnight within the same service day. Arrival and departure are equal when there is no
separate dwell time.

Conditionally Required:
- Required for the first and last stop in a trip (defined by `stop_times.stop_sequence`).
- Required for `timepoint=1`.
- Forbidden when `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.
- Optional otherwise.

Presence and type follow [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func ArrivalTimeField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stop_times", []string{"arrival_time"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the arrival_time value

		value, err := queries.Field(row.Source, "arrival_time")
		if err != nil {
			return err
		}

		//
		// 3. Check if the arrival_time is required

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
