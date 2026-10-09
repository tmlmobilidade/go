package stop_times

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: start_pickup_drop_off_window
  - Presence: Conditionally Required
  - Type: Time

# Description

Time that on-demand service becomes available in a GeoJSON location, location group, or stop.

Conditionally Required:

  - Required if stop_times.location_group_id or stop_times.location_id is defined.
  - Required if end_pickup_drop_off_window is defined.
  - Forbidden if arrival_time or departure_time is defined.
  - Optional otherwise.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func StartPickupDropOffWindowValidation(stopTime *types.StopTime, row int, rules *types.StopTimesRules) {
	ctx := lib.NewValidationContext("start_pickup_drop_off_window", "stop_times.txt", "stop_times_start_pickup_drop_off_window_valid", row, services.AppMessageService)
	if rules != nil && rules.StartPickupDropOffWindow.Severity != "" {
		ctx.WithSeverity(rules.StartPickupDropOffWindow.Severity)
	}

	// 1. Validate start_pickup_drop_off_window is forbidden: forbidden if arrival_time or departure_time are defined
	if (stopTime.ArrivalTime != nil && *stopTime.ArrivalTime != "") || (stopTime.DepartureTime != nil && *stopTime.DepartureTime != "") {
		if stopTime.StartPickupDropOffWindow != nil && *stopTime.StartPickupDropOffWindow != "" {
			ctx.AddError(ctx.GetTranslatedMessage("forbidden_arrival_departure"))
		}
		return
	}

	// 2. Validate start_pickup_drop_off_window is forbidden
	if stopTime.StartPickupDropOffWindow != nil && ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate start_pickup_drop_off_window is conditionally required
	required := false
	// Required if location_group_id or location_id is defined
	if (stopTime.LocationGroupId != nil && *stopTime.LocationGroupId != "") || (stopTime.LocationId != nil && *stopTime.LocationId != "") {
		required = true
	}
	// Required if end_pickup_drop_off_window is defined
	if stopTime.EndPickupDropOffWindow != nil && *stopTime.EndPickupDropOffWindow != "" {
		required = true
	}

	if required {
		if stopTime.StartPickupDropOffWindow == nil || *stopTime.StartPickupDropOffWindow == "" {
			ctx.AddError(ctx.GetTranslatedMessage("required_location_group_id_start_pickup_dropoff"))
			return
		}
	}

	// 4. Validate start_pickup_drop_off_window is a valid time
	if stopTime.StartPickupDropOffWindow != nil && *stopTime.StartPickupDropOffWindow != "" {
		if !lib.ValidateTime(*stopTime.StartPickupDropOffWindow) {
			ctx.AddError(ctx.GetTranslatedMessage("invalid", *stopTime.StartPickupDropOffWindow))
			return
		}
	}

	// 5. Validate start_pickup_drop_off_window is present
	if stopTime.StartPickupDropOffWindow == nil && !ctx.ShouldIgnore() {
		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}
}
