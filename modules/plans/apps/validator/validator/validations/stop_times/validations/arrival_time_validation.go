package stop_times

import (
	"main/lib"
	"main/services"
	"main/types"
	"math"
	"strconv"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: arrival_time
  - Presence: Conditionally Required
  - Type: Time

# Description

Arrival time at the stop (defined by `stop_times.stop_id`) for a specific trip (defined by `stop_times.trip_id`) in the time zone specified by `agency.agency_timezone`, not `stops.stop_timezone`.

If there are not separate times for arrival and departure at a stop, `arrival_time` and `departure_time` should be the same.

For times occurring after midnight on the service day, enter the time as a value greater than 24:00:00 in HH:MM:SS.

If exact arrival and departure times (timepoint=1) are not available, estimated or interpolated arrival and departure times (timepoint=0) should be provided.

Conditionally Required:

  - Required for the first and last stop in a trip (defined by `stop_times.stop_sequence`).
  - Required for `timepoint=1`.
  - Forbidden when `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.
  - Optional otherwise.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func ArrivalTimeValidation(stopTime *types.StopTime, row int, gtfs *types.Gtfs, rules *types.StopTimesRules, tripStopSequences map[string]types.TripStopSequence) {
	ctx := lib.NewValidationContext("arrival_time", "stop_times.txt", "arrival_time_ordering_with_departure_and_frequencies", row, services.AppMessageService)
	if rules != nil && rules.ArrivalTime.Severity != "" {
		ctx.WithSeverity(rules.ArrivalTime.Severity)
	}

	// Required for timepoint=1
	if stopTime.Timepoint != nil && *stopTime.Timepoint == 1 && stopTime.ArrivalTime == nil {
		ctx.AddError(ctx.GetTranslatedMessage("arrival_time_validation.required_timepoint"))
		return
	}

	// Forbidden when start_pickup_drop_off_window or end_pickup_drop_off_window are defined
	if (stopTime.StartPickupDropOffWindow != nil || stopTime.EndPickupDropOffWindow != nil) && stopTime.ArrivalTime != nil {
		ctx.AddError(ctx.GetTranslatedMessage("arrival_time_validation.forbidden_with_window"))
		return
	}

	// Required for the first and last stop in a trip
	if stopTime.StopSequence != nil && stopTime.TripId != nil {
		// Use cached trip stop sequences instead of querying database
		seq, exists := tripStopSequences[*stopTime.TripId]
		if !exists {
			// Fallback to database query if not in cache (shouldn't happen)
			stopTimes, err := gtfs.GetRowsById("stop_times", *stopTime.TripId)
			if err != nil || len(stopTimes) == 0 {
				ctx.AddError(ctx.GetTranslatedMessage("arrival_time_validation.invalid_trip_id"))
				return
			}

			minStopSequence := math.MaxInt
			maxStopSequence := math.MinInt

			for _, row := range stopTimes {
				stopTimeRaw, err := gtfs.GetStopTime(row)
				if err != nil {
					continue
				}
				stopSequence, err := strconv.Atoi(stopTimeRaw.StopSequence)
				if err != nil {
					ctx.AddError(ctx.GetTranslatedMessage("arrival_time_validation.invalid_stop_sequence"))
					return
				}

				if stopSequence < minStopSequence {
					minStopSequence = stopSequence
				}
				if stopSequence > maxStopSequence {
					maxStopSequence = stopSequence
				}
			}

			if *stopTime.StopSequence == minStopSequence && stopTime.ArrivalTime == nil {
				ctx.AddError(ctx.GetTranslatedMessage("arrival_time_validation.required_first_stop"))
				return
			}

			if *stopTime.StopSequence == maxStopSequence && stopTime.ArrivalTime == nil {
				ctx.AddError(ctx.GetTranslatedMessage("arrival_time_validation.required_last_stop"))
				return
			}
		} else {
			// Use cached values - much faster!
			stopSequence := *stopTime.StopSequence

			if stopSequence == seq.Min && stopTime.ArrivalTime == nil {
				ctx.AddError(ctx.GetTranslatedMessage("arrival_time_validation.required_first_stop"))
				return
			}

			if stopSequence == seq.Max && stopTime.ArrivalTime == nil {
				ctx.AddError(ctx.GetTranslatedMessage("arrival_time_validation.required_last_stop"))
				return
			}
		}
	}

	// Validate time
	if stopTime.ArrivalTime != nil {
		if !lib.ValidateTime(*stopTime.ArrivalTime) {
			ctx.AddError(ctx.GetTranslatedMessage("arrival_time_validation.invalid_time"))
			return
		}
	}

	// Optional
	if stopTime.ArrivalTime == nil && !ctx.ShouldIgnore() {
		message := ctx.GetRequiredMessage("arrival_time_validation.required", "arrival_time_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}
}
