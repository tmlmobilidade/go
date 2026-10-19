package calendar_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [sunday]
  - Presence: Required
  - Type: Boolean

# Description

Indicates whether service is available on Sunday.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func SundayValidation(db *services.SQLiteContext, rules *types.CalendarRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("sunday", "calendar.txt", "calendar_sunday_field", db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule("calendar_sunday_field")
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 2. Get the value

	value, err := db.Calendar.Field("sunday")
	if err != nil {
		return err
	}

	//
	// 3. Validate value is present

	if value == "" {
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
