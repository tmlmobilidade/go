package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/validations"
	standardutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/utils"
	"sort"
	"strconv"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: [arrival_time, trip_id, stop_sequence, departure_time]
  - Presence: Conditionally Required, Required, Required, Conditionally Required
  - Type: Time, Foreign ID referencing trips.trip_id, Non-negative integer, Time

# Description

  - arrival_time: Arrival time at the stop for this trip, using agency.agency_timezone rather than
    stops.stop_timezone. Use values beyond 24:00:00 after midnight within the same service day. Arrival and departure
    are equal when there is no separate dwell time.
  - trip_id: Identifies the trip to which this stop-time record belongs.
  - stop_sequence: Position of the stop within the trip. Values must increase, but gaps between sequence numbers are
    permitted.
  - departure_time: Departure time from the stop for this trip, using agency.agency_timezone rather than
    stops.stop_timezone. Use values beyond 24:00:00 after midnight within the same service day. Arrival and departure
    are equal when there is no separate dwell time.

Validation: Groups stop times by trip_id and sorts them by numeric stop_sequence, omitting rows with unreadable
sequences. For each adjacent pair it prefers the previous departure and current arrival, falling back to the other
time in each row. It reports a strictly earlier current time. Usable times require non-negative hours and minutes
and seconds from 0 to 59; hours may exceed 23. Missing or unusable times break comparison, and equal times pass.
Arrival and departure within one row are not compared.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func ArrivalDepartureTimeSequence(ctx *context.ValidationContext) error {
	seen := map[string]bool{}
	return context.ForEachRow(ctx, "stop_times", []string{"arrival_time", "trip_id", "stop_sequence", "departure_time"}, func(row *context.ValidationContext) error {
		if context.ShouldIgnore(row) {
			return nil
		}
		tripID, err := queries.Field(row.Source, "trip_id")
		if err != nil || tripID == "" {
			return err
		}
		if seen[tripID] {
			return nil
		}
		seen[tripID] = true
		var stops []validationTypes.TimeSequenceStop
		err = queries.ForEachMatchingFields(row.Source.Table, "trip_id", []any{tripID}, []string{"stop_sequence", "arrival_time", "departure_time"}, func(source *sqliteTypes.SQLiteRow, values map[string]string) error {
			sequence, err := strconv.Atoi(values["stop_sequence"])
			if err != nil {
				return nil
			}
			stops = append(stops, validationTypes.TimeSequenceStop{Row: source.Row, StopSequence: sequence, ArrivalTime: values["arrival_time"], DepartureTime: values["departure_time"]})
			return nil
		})
		if err != nil {
			return err
		}
		sort.SliceStable(stops, func(i, j int) bool { return stops[i].StopSequence < stops[j].StopSequence })
		for i := 1; i < len(stops); i++ {
			previous, current := stops[i-1], stops[i]
			previousTime, previousLabel, previousOK := standardutils.StopTime(previous, true)
			currentTime, currentLabel, currentOK := standardutils.StopTime(current, false)
			if previousOK && currentOK && currentTime < previousTime {
				finding := *row
				finding.Row = current.Row
				context.AddMessage(&finding, context.GetTranslatedMessage(&finding, "decreasing", tripID, previous.StopSequence, previousLabel, current.StopSequence, currentLabel))
				row.Failed = row.Failed || finding.Failed
			}
		}
		return nil
	})
}
