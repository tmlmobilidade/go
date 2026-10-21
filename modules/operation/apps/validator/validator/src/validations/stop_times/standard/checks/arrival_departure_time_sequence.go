package stop_times_standard

import (
	"main/lib"
	stopTimesLib "main/lib/stop_times"
	"main/services"
	"main/types"
	stopTimesTypes "main/types/stop_times"
	"sort"
	"strconv"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Fields: arrival_time, departure_time, stop_sequence
  - Presence: Conditionally Required
  - Type: Time

# Description

Times must follow the order in which the vehicle serves the stops, so they must never go
backwards between two consecutive stops of the same trip.

Each pair of consecutive stops is compared using the last time of the previous stop
(departure_time, falling back to arrival_time) and the first time of the current stop
(arrival_time, falling back to departure_time).

Stops without a usable time are skipped, as missing or malformed values are already
reported by the arrival_time and departure_time validations.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func ArrivalDepartureTimeSequence(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule and severity

	const ruleID = "stop_times_arrival_departure_time_non_decreasing_by_stop_sequence"
	ctx := lib.NewValidationContext("arrival_time", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	if ctx.ShouldSkip() {
		return nil
	}

	//
	// 2. Read this trip's sequence and times from SQLite

	tripID, err := db.StopTimes.Field("trip_id")
	if err != nil {
		return err
	}

	//
	// 3. Get the stop times for this trip

	table, err := db.Table("stop_times")
	if err != nil {
		return err
	}

	//
	// 4. Read this trip's sequence and times from SQLite

	var stopTimes []stopTimesTypes.TimeSequenceStop
	err = table.ForEachMatching("trip_id", tripID, func(row *services.SQLiteRow) error {
		values, err := row.Fields("stop_sequence", "arrival_time", "departure_time")
		if err != nil {
			return err
		}
		sequence, err := strconv.Atoi(values["stop_sequence"])
		if err != nil {
			// Rows without a usable sequence were excluded by the legacy parser.
			return nil
		}
		arrival, departure := values["arrival_time"], values["departure_time"]
		stopTimes = append(stopTimes, stopTimesTypes.TimeSequenceStop{
			Row: row.Row, StopSequence: sequence, ArrivalTime: &arrival, DepartureTime: &departure,
		})
		return nil
	})
	if err != nil {
		return err
	}

	//
	// 5. Order by sequence, using source row order for repeated sequences

	sort.Slice(stopTimes, func(i, j int) bool {
		if stopTimes[i].StopSequence == stopTimes[j].StopSequence {
			return stopTimes[i].Row < stopTimes[j].Row
		}
		return stopTimes[i].StopSequence < stopTimes[j].StopSequence
	})

	//
	// 6. Compare neighbouring stops without bridging missing or invalid times

	for i := 1; i < len(stopTimes); i++ {
		previous, current := stopTimes[i-1], stopTimes[i]
		previousTime, previousLabel, ok := stopTimesLib.LastStopTime(previous)
		if !ok {
			continue
		}
		currentTime, currentLabel, ok := stopTimesLib.FirstStopTime(current)
		if !ok {
			continue
		}
		if currentTime < previousTime {
			finding := lib.NewValidationContext("arrival_time", "stop_times.txt", ruleID, current.Row, services.AppMessageService)
			finding.WithSeverity(ctx.Severity)
			finding.AddMessageWithSeverity(finding.GetTranslatedMessage(
				"decreasing", tripID, previous.StopSequence, previousLabel, current.StopSequence, currentLabel,
			))
		}
	}
	return nil
}
