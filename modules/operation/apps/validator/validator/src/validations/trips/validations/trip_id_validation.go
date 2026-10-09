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
func TripIdValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("trip_id", "trips.txt", "trip_id_unique", row, services.AppMessageService)
	if rules != nil && rules.TripId.Severity != "" {
		ctx.WithSeverity(rules.TripId.Severity)
	}

	// 1. Validate trip_id is present
	if trip.TripId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate trip_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate trip_id is unique
	rows, err := gtfs.GetRowsById("trips", *trip.TripId)
	if err == nil && len(rows) > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("duplicate", *trip.TripId))
		return
	}
}
