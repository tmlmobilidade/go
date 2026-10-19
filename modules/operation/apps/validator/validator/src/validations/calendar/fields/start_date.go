package calendar_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [start_date]
  - Presence: Required
  - Type: Date

# Description

Start service day for the service interval.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func StartDateValidation(db *services.SQLiteContext, rules *types.CalendarRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("start_date", "calendar.txt", "calendar_start_date_field", db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule("calendar_start_date_field")
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 2. Get the date value

	date, err := db.Calendar.Field("start_date")
	if err != nil {
		return err
	}

	//
	// 3. Validate date is present

	if date == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetSeverityMessage("required", "recommended", "informational")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 4. Return success

	return nil
}
