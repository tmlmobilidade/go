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
func DateValidation(db *services.SQLiteContext, dateType string, rules *types.RuleContext) error {
	const ruleID = "calendar_start_end_dates_valid_yyyymmdd_order"

	ctx := lib.NewValidationContext(dateType, "calendar.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 1. Get the date value

	date, err := db.Calendar.Field(dateType)
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
	}

	//
	// 5. Return success

	return nil
}
