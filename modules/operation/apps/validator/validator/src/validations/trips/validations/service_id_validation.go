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
func ServiceIdValidation(trip *types.Trip, row int, gtfs *types.Gtfs, calendarRowsCache, calendarDatesRowsCache map[string][]int, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("service_id", "trips.txt", "trips_service_id_references_calendar_service", row, services.AppMessageService)
	if rules != nil && rules.ServiceId.Severity != "" {
		ctx.WithSeverity(rules.ServiceId.Severity)
	}

	// 1. Validate service_id is present
	if trip.ServiceId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate service_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate service_id is Foreign Key referencing calendar.service_id or calendar_dates.service_id (use cache to avoid repeated queries)
	calendarRows, err := gtfs.GetCachedRowsById(calendarRowsCache, "calendar", *trip.ServiceId)
	if err == nil && len(calendarRows) > 0 {
		return
	}
	calendarDatesRows, err := gtfs.GetCachedRowsById(calendarDatesRowsCache, "calendar_dates", *trip.ServiceId)
	if err == nil && len(calendarDatesRows) > 0 {
		return
	}
	ctx.AddError(ctx.GetTranslatedMessage("not_found", map[string]any{"service_id": *trip.ServiceId}))
}
