package stop_times

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [stop_times.txt]
- Field: trip_id
- Presence: Required
- Type: Foreign ID referencing trips.trip_id

# Description

Identifies a trip.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func TripIdValidation(stopTime *types.StopTime, row int, gtfs *types.Gtfs, rules *types.StopTimesRules) {
	ctx := lib.NewValidationContext("trip_id", "stop_times.txt", "stop_times_trip_id_references_trips_table", row, services.AppMessageService)
	if rules != nil && rules.TripId.Severity != "" {
		ctx.WithSeverity(rules.TripId.Severity)
	}

	// 1. Validate trip_id is present
	if stopTime.TripId == nil || *stopTime.TripId == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("trip_id_validation.required", "trip_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate trip_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("trip_id_validation.forbidden"))
		return
	}

	// 3. Validate trip_id is Foreign Key referencing trips.trip_id
	// Use IdMap cache instead of database query for performance
	if !lib.GtfsIdMapKeyExists(gtfs, "trips", *stopTime.TripId) {
		ctx.AddError(ctx.GetTranslatedMessage("trip_id_validation.not_found", *stopTime.TripId))
		return
	}
}
