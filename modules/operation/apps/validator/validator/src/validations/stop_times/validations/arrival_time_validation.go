package stop_times

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: arrival_time
  - Presence: Required
  - Type: Time

# Description

Arrival time at the stop (defined by `stop_times.stop_id`) for a specific trip (defined by `stop_times.trip_id`) in the time zone specified by `agency.agency_timezone`, not `stops.stop_timezone`.

If there are not separate times for arrival and departure at a stop, `arrival_time` and `departure_time` should be the same.

For times occurring after midnight on the service day, enter the time as a value greater than 24:00:00 in HH:MM:SS.

If exact arrival and departure times (timepoint=1) are not available, estimated or interpolated arrival and departure times (timepoint=0) should be provided.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func ArrivalTimeValidation(stopTime *types.StopTime, row int, rules *types.StopTimesRules) {
	ctx := lib.NewValidationContext("arrival_time", "stop_times.txt", "stop_times_arrival_time_ordering_with_departure_and_frequencies", row, services.AppMessageService)
	if rules != nil && rules.ArrivalTime.Severity != "" {
		ctx.WithSeverity(rules.ArrivalTime.Severity)
	}

	// 1. Validate arrival_time is present
	if stopTime.ArrivalTime == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("arrival_time_validation.required", "arrival_time_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate arrival_time is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("arrival_time_validation.forbidden"))
		return
	}

	// 3. Validate arrival_time is a valid time
	if !lib.ValidateTime(*stopTime.ArrivalTime) {
		ctx.AddError(ctx.GetTranslatedMessage("arrival_time_validation.invalid", *stopTime.ArrivalTime))
		return
	}
}
