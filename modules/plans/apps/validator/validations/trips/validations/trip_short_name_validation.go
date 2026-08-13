package trips

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: trip_short_name
  - Presence: Optional
  - Type: Text

# Description

Public facing text used to identify the trip to riders, for instance, to identify train numbers for commuter rail trips.
If riders do not commonly rely on trip names, `trip_short_name` should be empty.
A `trip_short_name` value, if provided, should uniquely identify a trip within a service day; it should not be used for destination names or limited/express designations.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func TripShortNameValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("trip_short_name", "trips.txt", "trip_short_name_exclusivity", row, services.AppMessageService)
	if rules != nil && rules.TripShortName.Severity != "" {
		ctx.WithSeverity(rules.TripShortName.Severity)
	}

	// 1. Validate trip_short_name is required
	if trip.TripShortName == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("trip_short_name_validation.required", "trip_short_name_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate trip_short_name is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("trip_short_name_validation.forbidden"))
		return
	}

}
