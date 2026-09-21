package trips

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: service_id
  - Presence: Required
  - Type: Foreign Key referencing calendar.service_id or calendar_dates.service_id

# Description

Identifies a service.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func ServiceIdValidation(trip *types.Trip, row int, gtfs *types.Gtfs, calendarRowsCache, calendarDatesRowsCache map[string][]int) {
	ctx := lib.NewValidationContext("service_id", "trips.txt", "service_id_references_calendar_service", row, services.AppMessageService)

	if trip.ServiceId == nil {
		ctx.AddError(ctx.GetTranslatedMessage("service_id_validation.required"))
		return
	}

	// Check in calendar or calendar_dates (use cache to avoid repeated queries)
	calendarRows, err := gtfs.GetCachedRowsById(calendarRowsCache, "calendar", *trip.ServiceId)
	if err == nil && len(calendarRows) > 0 {
		return
	}
	calendarDatesRows, err := gtfs.GetCachedRowsById(calendarDatesRowsCache, "calendar_dates", *trip.ServiceId)
	if err == nil && len(calendarDatesRows) > 0 {
		return
	}
	ctx.AddError(ctx.GetTranslatedMessage("service_id_validation.not_found", map[string]any{"service_id": *trip.ServiceId}))
}
