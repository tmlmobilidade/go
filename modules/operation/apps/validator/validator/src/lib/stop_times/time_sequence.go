package stop_times

import (
	"main/lib"
	stopTimesTypes "main/types/stop_times"
	"strconv"
	"strings"
)

// FirstStopTime returns the first valid time available for a stop. For the
// current stop, arrival_time takes precedence over departure_time.
func FirstStopTime(stopTime stopTimesTypes.TimeSequenceStop) (int, string, bool) {
	if stopTime.ArrivalTime != nil {
		seconds, ok := ParseStopTimeSeconds(*stopTime.ArrivalTime)
		if ok {
			return seconds, *stopTime.ArrivalTime, true
		}
	}

	if stopTime.DepartureTime != nil {
		seconds, ok := ParseStopTimeSeconds(*stopTime.DepartureTime)
		if ok {
			return seconds, *stopTime.DepartureTime, true
		}
	}

	return 0, "", false
}

// LastStopTime returns the last valid time available for a stop. For the
// previous stop, departure_time takes precedence over arrival_time.
func LastStopTime(stopTime stopTimesTypes.TimeSequenceStop) (int, string, bool) {
	if stopTime.DepartureTime != nil {
		seconds, ok := ParseStopTimeSeconds(*stopTime.DepartureTime)
		if ok {
			return seconds, *stopTime.DepartureTime, true
		}
	}

	if stopTime.ArrivalTime != nil {
		seconds, ok := ParseStopTimeSeconds(*stopTime.ArrivalTime)
		if ok {
			return seconds, *stopTime.ArrivalTime, true
		}
	}

	return 0, "", false
}

// ParseStopTimeSeconds parses a GTFS stop time into seconds since midnight.
func ParseStopTimeSeconds(value string) (int, bool) {
	if !lib.ValidateTime(value) {
		return 0, false
	}

	parts := strings.Split(value, ":")
	if len(parts) != 3 {
		return 0, false
	}

	hours, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0, false
	}
	minutes, err := strconv.Atoi(parts[1])
	if err != nil {
		return 0, false
	}
	seconds, err := strconv.Atoi(parts[2])
	if err != nil {
		return 0, false
	}

	return hours*3600 + minutes*60 + seconds, true
}
