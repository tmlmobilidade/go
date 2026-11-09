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
* ArrivalDepartureTimeSequence compares neighboring stops within each trip.
* The previous departure (or arrival) must precede the next arrival (or departure).
* Missing or malformed times break comparisons instead of joining their neighbors.
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
