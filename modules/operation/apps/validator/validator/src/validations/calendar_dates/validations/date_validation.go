package calendar_dates

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [calendar_dates.txt]
  - Field: date
  - Presence: Required
  - Type: Date

# Description

Date when service exception occurs.

[calendar_dates.txt]: https://gtfs.org/schedule/reference/#calendar_datestxt
*/
func DateValidation(calendarDate *types.CalendarDates, row int) {
	ctx := lib.NewValidationContext("date", "calendar_dates.txt", "calendar_dates_exception_date_valid_yyyymmdd", row, services.AppMessageService)

	date := calendarDate.Date

	// 1. Validate date is present
	if date == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("date_validation.required", "date_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate date is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("date_validation.forbidden"))
		return
	}

	// 3. Validate date is a valid service date
	if !lib.IsValidServiceDate(date) {
		ctx.AddError(ctx.GetTranslatedMessage("date_validation.invalid", date))
		return
	}
}
