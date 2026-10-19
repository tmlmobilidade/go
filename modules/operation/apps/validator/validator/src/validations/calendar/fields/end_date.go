package calendar_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [end_date]
  - Presence: Required
  - Type: Date

# Description

End service day for the service interval. This service day is included in the interval.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func EndDateValidation(db *services.SQLiteContext, rules *types.CalendarRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("end_date", "calendar.txt", "calendar_end_date_field", db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule("calendar_end_date_field")
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 2. Get the date value

	date, err := db.Calendar.Field("end_date")
	if err != nil {
		return err
	}

	//
	// 2. Validate date is present

	if date == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetSeverityMessage("required", "recommended", "informational")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 3. Return success

	return nil
}
