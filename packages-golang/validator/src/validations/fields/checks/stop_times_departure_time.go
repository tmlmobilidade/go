package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: departure_time
  - Presence: Conditionally Required
  - Type: Time

# Description

Departure time from the stop for this trip, using agency.agency_timezone rather than stops.stop_timezone. Use
values beyond 24:00:00 after midnight within the same service day. Arrival and departure are equal when there is no
separate dwell time.

Conditionally Required:
- Required for `timepoint=1`.
- Forbidden when `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.
- Optional otherwise.

Presence and type follow [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func DepartureTimeField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stop_times", []string{"departure_time"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the departure_time value

		value, err := queries.Field(row.Source, "departure_time")
		if err != nil {
			return err
		}

		//
		// 3. Check if the departure_time is required

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
