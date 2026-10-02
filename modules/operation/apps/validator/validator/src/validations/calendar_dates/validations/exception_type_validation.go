package calendar_dates

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes
  - File: [calendar_dates.txt]
  - Field: exception_type
  - Presence: Required
  - Type: Enum

# Description

Indicates whether service is available on the date specified in the date field.

Valid options are:

  - 1 - Service has been added for the specified date.
  - 2 - Service has been removed for the specified date.

# Example

Suppose a route has one set of trips available on holidays and another set of trips available on all other days.

One service_id could correspond to the regular service schedule and another service_id could correspond to the holiday schedule.

For a particular holiday, the [calendar_dates.txt] file could be used to add the holiday to the holiday service_id and to remove the holiday from the regular service_id schedule.

[calendar_dates.txt]: https://gtfs.org/schedule/reference/#calendar_datestxt
*/
func ExceptionTypeValidation(calendarDate *types.CalendarDates, row int, rules *types.CalendarDatesRules) {
	ctx := lib.NewValidationContext("exception_type", "calendar_dates.txt", "calendar_dates_exception_type_add_or_remove_service", row, services.AppMessageService)
	if rules != nil && rules.ExceptionType.Severity != types.SEVERITY_IGNORE {
		ctx.WithSeverity(rules.ExceptionType.Severity)
	}

	validExceptionTypes := []int{1, 2}

	// 1. Validate exception_type is present
	if calendarDate.ExceptionType == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate exception_type is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate exception_type is a valid exception type
	if !slices.Contains(validExceptionTypes, *calendarDate.ExceptionType) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", *calendarDate.ExceptionType))
		return
	}

	// 4. Validate Rule Options
	if rules != nil && rules.ExceptionType.Options != nil {
		if slices.Contains(*rules.ExceptionType.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.ExceptionType.Options, strconv.Itoa(*calendarDate.ExceptionType)) {
			ctx.AddError(ctx.GetTranslatedMessage("not_allowed", *calendarDate.ExceptionType))
		}

		ctx.AddError(ctx.GetTranslatedMessage("not_allowed", *calendarDate.ExceptionType))
		return
	}
}
