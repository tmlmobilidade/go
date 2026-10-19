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
func ExceptionTypeValidation(db *services.SQLiteContext, rules *types.CalendarDatesRules) error {
	ctx := lib.NewValidationContext("exception_type", "calendar_dates.txt", "calendar_dates_exception_type_add_or_remove_service", db.Row, services.AppMessageService, rules)

	validExceptionTypes := []int{1, 2}

	//
	// 1. Get the exception_type value

	exceptionType, err := db.CalendarDates.Field("exception_type")
	if err != nil {
		return err
	}

	//
	// 2. Validate exception_type is present

	if exceptionType == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 3. Validate exception_type is forbidden

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	//
	// 4. Validate exception_type is a valid exception type

	exceptionTypeInt, err := strconv.Atoi(exceptionType)
	if err != nil || !slices.Contains(validExceptionTypes, exceptionTypeInt) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", exceptionType))
		return nil
	}

	//
	// 5. Validate Rule Options

	if rules != nil && rules.Rule("calendar_dates_exception_type_add_or_remove_service").Options != nil {
		if slices.Contains(*rules.Rule("calendar_dates_exception_type_add_or_remove_service").Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.Rule("calendar_dates_exception_type_add_or_remove_service").Options, exceptionType) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", exceptionType))
		}
	}

	//
	// 6. Return success

	return nil
}
