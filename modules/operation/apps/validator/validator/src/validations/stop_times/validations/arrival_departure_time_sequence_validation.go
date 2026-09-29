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

Checks that arrival_time and departure_time do not go backwards between consecutive
stops of the same trip when ordered by stop_sequence.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func ArrivalDepartureTimeSequenceValidation(stopTimesByTrip map[string][]stopTimesTypes.TimeSequenceStop, rules *types.StopTimesRules) {
	for tripId, stopTimes := range stopTimesByTrip {
		// 1. Order the trip's stops by stop_sequence, keeping file order when it repeats
		sort.Slice(stopTimes, func(i, j int) bool {
			if stopTimes[i].StopSequence == stopTimes[j].StopSequence {
				return stopTimes[i].Row < stopTimes[j].Row
			}
			return stopTimes[i].StopSequence < stopTimes[j].StopSequence
		})

		// 2. Compare each stop with the one that precedes it
		for i := 1; i < len(stopTimes); i++ {
			previous, current := stopTimes[i-1], stopTimes[i]

			ctx := lib.NewValidationContext("arrival_time", "stop_times.txt", "stop_times_arrival_departure_time_non_decreasing_by_stop_sequence", current.Row, services.AppMessageService)
			if rules != nil && rules.ArrivalDepartureSequence.Severity != "" {
				ctx.WithSeverity(rules.ArrivalDepartureSequence.Severity)
			}

			if ctx.ShouldSkip() {
				continue
			}

			// 3. Resolve the last time of the previous stop and the first time of the current stop
			previousTime, previousTimeLabel, ok := stopTimesLib.LastStopTime(previous)
			if !ok {
				continue
			}

			currentTime, currentTimeLabel, ok := stopTimesLib.FirstStopTime(current)
			if !ok {
				continue
			}

			// 4. Check if the times are non-decreasing along the stop sequence
			if currentTime < previousTime {
				ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage(
					"arrival_departure_time_sequence_validation.decreasing",
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
