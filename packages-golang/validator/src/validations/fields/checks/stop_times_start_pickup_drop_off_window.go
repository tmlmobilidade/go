package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: start_pickup_drop_off_window
  - Presence: Conditionally Required
  - Type: Time

# Description

Start of the interval during which on-demand boarding or alighting is available at the stop, location group or
GeoJSON location.

Conditionally Required:
- Required if `stop_times.location_group_id` or `stop_times.location_id` is defined.
- Required if `end_pickup_drop_off_window` is defined.
- Forbidden if `arrival_time` or `departure_time` is defined.
- Optional otherwise.

Presence and type follow [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func StartPickupDropOffWindowField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stop_times", []string{"start_pickup_drop_off_window", "arrival_time", "departure_time"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the start_pickup_drop_off_window value

		values, err := queries.Fields(row.Source, "start_pickup_drop_off_window", "arrival_time", "departure_time")
		if err != nil {
			return err
		}

		//
		// 3. Check if the start_pickup_drop_off_window is required

		if values["start_pickup_drop_off_window"] == "" && values["arrival_time"] == "" && values["departure_time"] == "" {
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
