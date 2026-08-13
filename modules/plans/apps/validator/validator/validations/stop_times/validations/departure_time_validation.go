package stop_times

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: departure_time
  - Presence: Conditionally Required
  - Type: Time

# Description

Departure time from the stop (defined by `stop_times.stop_id`) for a specific trip (defined by `stop_times.trip_id`) in the time zone specified by `agency.agency_timezone`, not `stops.stop_timezone`.

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
func DepartureTimeValidation(stopTime *types.StopTime, row int, gtfs *types.Gtfs, rules *types.StopTimesRules) {
	ctx := lib.NewValidationContext("departure_time", "stop_times.txt", "departure_time_ordering_with_arrival_and_timepoint", row, services.AppMessageService)
	if rules != nil && rules.DepartureTime.Severity != "" {
		ctx.WithSeverity(rules.DepartureTime.Severity)
	}

	// Required for timepoint=1
	if stopTime.Timepoint != nil && *stopTime.Timepoint == 1 && stopTime.DepartureTime == nil {
		ctx.AddError(ctx.GetTranslatedMessage("departure_time_validation.required_timepoint"))
		return
	}

	// Forbidden when start_pickup_drop_off_window or end_pickup_drop_off_window are defined
	if (stopTime.StartPickupDropOffWindow != nil || stopTime.EndPickupDropOffWindow != nil) && stopTime.DepartureTime != nil {
		ctx.AddError(ctx.GetTranslatedMessage("departure_time_validation.forbidden_with_window"))
		return
	}

	// Validate time
	if stopTime.DepartureTime != nil {
		if !lib.ValidateTime(*stopTime.DepartureTime) {
			ctx.AddError(ctx.GetTranslatedMessage("departure_time_validation.invalid_time"))
			return
		}
	}

	// Optional
	if stopTime.DepartureTime == nil && !ctx.ShouldIgnore() {
		message := ctx.GetRequiredMessage("departure_time_validation.required", "departure_time_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}
}
