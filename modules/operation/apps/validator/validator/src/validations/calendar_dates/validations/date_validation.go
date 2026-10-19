package calendar_dates

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
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
func DateValidation(db *services.SQLiteContext, rules *types.CalendarDatesRules) error {
	ctx := lib.NewValidationContext("date", "calendar_dates.txt", "calendar_dates_exception_date_valid_yyyymmdd", db.Row, services.AppMessageService, rules)

	//
	// 1. Get the date value

	date, err := db.CalendarDates.Field("date")
	if err != nil {
		return err
	}

	//
	// 2. Validate date is present

	if date == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 3. Validate date is forbidden

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	//
	// 4. Validate date is a valid service date

	if !lib.IsValidServiceDate(date) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", date))
		return nil
	}

	//
	// 5. Validate rules

	if rules != nil && rules.Rule("calendar_dates_exception_date_valid_yyyymmdd").Options != nil {
		if slices.Contains(*rules.Rule("calendar_dates_exception_date_valid_yyyymmdd").Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.Rule("calendar_dates_exception_date_valid_yyyymmdd").Options, date) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", date))
		}
	}

	//
	// 6. Return success

	return nil
}
