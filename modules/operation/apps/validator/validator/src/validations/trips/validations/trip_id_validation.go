package trips

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: trip_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a trip.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func TripIdValidation(trip *types.Trip, row int, gtfs *types.Gtfs) {
	ctx := lib.NewValidationContext("trip_id", "trips.txt", "trip_id_unique", row, services.AppMessageService)

	// 1. Validate trip_id is present
	if trip.TripId == nil {
		ctx.AddError(ctx.GetTranslatedMessage("trip_id_validation.required"))
		return
	}

	// 2. Validate trip_id is unique
	rows, err := gtfs.GetRowsById("trips", *trip.TripId)
	if err == nil && len(rows) > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("trip_id_validation.duplicate", *trip.TripId))
		return
	}
}
