package calendar_dates

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [calendar_dates.txt]
  - Field: service_id
  - Presence: Required
  - Type: Foreign ID referencing calendar.service_id or ID

# Description

Identifies a set of dates when a service exception occurs for one or more routes. Each (service_id, date) pair may only appear once in [calendar_dates.txt] if using [calendar.txt] and [calendar_dates.txt] in conjunction.

If a service_id value appears in both [calendar.txt] and [calendar_dates.txt], the information in [calendar_dates.txt] modifies the service information specified in [calendar.txt].

[calendar_dates.txt]: https://gtfs.org/schedule/reference/#calendar_datestxt
[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func ServiceIdValidation(calendarDate *types.CalendarDates, row int) {
	ctx := lib.NewValidationContext("service_id", "calendar_dates.txt", "calendar_dates_service_id_references_calendar", row, services.AppMessageService)

	serviceId := calendarDate.ServiceId

	if serviceId == "" {
		ctx.AddError(ctx.GetTranslatedMessage("service_id_validation.required"))
		return
	}
}
