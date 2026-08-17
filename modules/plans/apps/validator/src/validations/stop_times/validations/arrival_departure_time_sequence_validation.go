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
		sort.Slice(stopTimes, func(i, j int) bool {
			if stopTimes[i].StopSequence == stopTimes[j].StopSequence {
				return stopTimes[i].Row < stopTimes[j].Row
			}
			return stopTimes[i].StopSequence < stopTimes[j].StopSequence
		})

		for i := 1; i < len(stopTimes); i++ {
			validateStopTimePair(tripId, stopTimes[i-1], stopTimes[i], rules)
		}
	}
}

func validateStopTimePair(tripId string, previous stopTimesTypes.TimeSequenceStop, current stopTimesTypes.TimeSequenceStop, rules *types.StopTimesRules) {
	ctx := lib.NewValidationContext("arrival_time", "stop_times.txt", "arrival_departure_time_non_decreasing_by_stop_sequence", current.Row, services.AppMessageService)
	if rules != nil && rules.ArrivalDepartureSequence.Severity != "" {
		ctx.WithSeverity(rules.ArrivalDepartureSequence.Severity)
	}

	if ctx.ShouldSkip() {
		return
	}

	previousTime, previousTimeLabel, ok := stopTimesLib.LastStopTime(previous)
	if !ok {
		return
	}

	currentTime, currentTimeLabel, ok := stopTimesLib.FirstStopTime(current)
	if !ok {
		return
	}

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
