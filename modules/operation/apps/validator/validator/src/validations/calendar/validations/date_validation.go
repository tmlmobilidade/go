package calendar

import (
	"main/lib"
	"main/services"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [start_date, end_date]
  - Presence: Required
  - Type: Date

# Description

Start service day for the service interval.

End service day for the service interval. This service day is included in the interval.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func DateValidation(date string, dateType string, row int) {
	ctx := lib.NewValidationContext(dateType, "calendar.txt", "calendar_start_end_dates_valid_yyyymmdd_order", row, services.AppMessageService)

	// 1. Validate date is present
	if date == "" {
		ctx.AddError(ctx.GetTranslatedMessage("date_validation.required"))
		return
	}

	// 2. Validate date is a valid service date
	if !lib.IsValidServiceDate(date) {
		ctx.AddError(ctx.GetTranslatedMessage("date_validation.invalid", date))
		return
	}
}
