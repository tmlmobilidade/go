package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: [end_pickup_drop_off_window, arrival_time, departure_time]
  - Presence: Conditionally Required
  - Type: Time

# Description

  - end_pickup_drop_off_window: End of the interval during which on-demand boarding or alighting is available at the
    stop, location group or GeoJSON location.
  - arrival_time: Arrival time at the stop for this trip, using agency.agency_timezone rather than
    stops.stop_timezone. Use values beyond 24:00:00 after midnight within the same service day. Arrival and departure
    are equal when there is no separate dwell time.
  - departure_time: Departure time from the stop for this trip, using agency.agency_timezone rather than
    stops.stop_timezone. Use values beyond 24:00:00 after midnight within the same service day. Arrival and departure
    are equal when there is no separate dwell time.

Validation: For a populated end_pickup_drop_off_window, first rejects a populated arrival_time or departure_time.
It then checks for eight characters and three integer components separated by colons, without bounding minutes or
seconds. Empty windows are skipped, and the two window boundaries are not compared. Empty values are skipped;
required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func EndPickupDropOffWindowValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stop_times", []string{"end_pickup_drop_off_window", "arrival_time", "departure_time"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		//
		// 2. Read the window and related stop time values

		values, err := queries.Fields(rowCtx.Source, "end_pickup_drop_off_window", "arrival_time", "departure_time")
		if err != nil {
			return err
		}
		value := values["end_pickup_drop_off_window"]
		if value == "" {
			return nil
		}

		//
		// 3. Windows are forbidden when arrival or departure time is defined

		if values["arrival_time"] != "" || values["departure_time"] != "" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "forbidden_arrival_departure"))
			return nil
		}

		//
		// 4. Validate the time format

		if !validators.ValidateTime(value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 5. Return success

		return nil
	})
}
