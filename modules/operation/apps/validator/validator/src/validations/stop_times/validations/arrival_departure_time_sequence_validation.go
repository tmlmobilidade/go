package stop_times

import (
	"main/lib"
	stopTimesLib "main/lib/stop_times"
	"main/services"
	"main/types"
	stopTimesTypes "main/types/stop_times"
	"sort"
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
func ArrivalDepartureTimeSequenceValidation(stopTimesByTrip map[string][]stopTimesTypes.TimeSequenceStop, rules *types.StopTimesRules) {
	for tripId, stopTimes := range stopTimesByTrip {
		// 1. Sort the trip's stops by stop_sequence, falling back to file order when it repeats
		sort.Slice(stopTimes, func(i, j int) bool {
			if stopTimes[i].StopSequence == stopTimes[j].StopSequence {
				return stopTimes[i].Row < stopTimes[j].Row
			}
			return stopTimes[i].StopSequence < stopTimes[j].StopSequence
		})

		// 2. Compare each stop with the one that precedes it, reporting on the current row
		for i := 1; i < len(stopTimes); i++ {
			previous, current := stopTimes[i-1], stopTimes[i]

			ctx := lib.NewValidationContext("arrival_time", "stop_times.txt", "stop_times_arrival_departure_time_non_decreasing_by_stop_sequence", current.Row, services.AppMessageService)
			if rules != nil && rules.ArrivalDepartureSequence.Severity != "" {
				ctx.WithSeverity(rules.ArrivalDepartureSequence.Severity)
			}

			// 3. Check if the rule is disabled for this pair
			if ctx.ShouldSkip() {
				continue
			}

			// 4. Resolve the times to compare, skipping the pair if either stop has none
			previousTime, previousTimeLabel, ok := stopTimesLib.LastStopTime(previous)
			if !ok {
				continue
			}

			currentTime, currentTimeLabel, ok := stopTimesLib.FirstStopTime(current)
			if !ok {
				continue
			}

			// 5. Check if the times are non-decreasing along the stop sequence
			if currentTime < previousTime {
				ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage(
					"decreasing",
					tripId,
					previous.StopSequence,
					previousTimeLabel,
					current.StopSequence,
					currentTimeLabel,
				))
			}
		}
	}
}
