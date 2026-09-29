package calendar

import (
	"main/lib"
	"main/services"
	"main/types"
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
func DateValidation(date string, dateType string, row int, rules *types.CalendarRules) {
	ctx := lib.NewValidationContext(dateType, "calendar.txt", "calendar_start_end_dates_valid_yyyymmdd_order", row, services.AppMessageService)
	if rules != nil {
		rule := rules.StartDate
		if dateType == "end_date" {
			rule = rules.EndDate
		}
		if rule.Severity != "" {
			ctx.WithSeverity(rule.Severity)
		}
	}

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
