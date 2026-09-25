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
func TripIdValidation(stopTime *types.StopTime, row int, gtfs *types.Gtfs) {
	ctx := lib.NewValidationContext("trip_id", "stop_times.txt", "stop_times_trip_id_references_trips_table", row, services.AppMessageService)

	if stopTime.TripId == nil || *stopTime.TripId == "" {
		ctx.AddError(ctx.GetTranslatedMessage("trip_id_validation.required"))
		return
	}

	// Use IdMap cache instead of database query for performance
	if !lib.GtfsIdMapKeyExists(gtfs, "trips", *stopTime.TripId) {
		ctx.AddError(ctx.GetTranslatedMessage("trip_id_validation.not_found", *stopTime.TripId))
		return
	}
}
