package trips

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: trip_headsign
  - Presence: Required
  - Type: Text

# Description

Text that appears on signage identifying the trip's destination to riders.
This field is recommended for all services with headsign text displayed on the vehicle which may be used to distinguish amongst trips in a route.

If the headsign changes during a trip, values for `trip_headsign` may be overridden by defining values in `stop_times.stop_headsign` for specific `stop_time`s along the trip.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func TripHeadsignValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("trip_headsign", "trips.txt", "trip_headsign_present_when_short_name_absent", row, services.AppMessageService)
	if rules != nil && rules.TripHeadsign.Severity != "" {
		ctx.WithSeverity(rules.TripHeadsign.Severity)
	}

	// 1. Validate trip_headsign is present
	if trip.TripHeadsign == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate trip_headsign is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}
}
