package calendar_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [service_id]
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a set of dates when service is available for one or more routes.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func ServiceIdValidation(db *services.SQLiteContext, rules *types.CalendarRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("service_id", "calendar.txt", "calendar_service_id_field", db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule("calendar_service_id_field")
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 2. Get service_id and its occurrence count in calendar

	value, _, err := db.Calendar.FieldWithCount("service_id")
	if err != nil {
		return err
	}

	//
	// 3. Validate service_id is present

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
