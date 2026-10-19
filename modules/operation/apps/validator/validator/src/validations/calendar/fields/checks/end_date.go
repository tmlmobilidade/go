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
	// 1. Get the rule

	const ruleID = "calendar_end_date_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("end_date", "calendar.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 2. Get the date value

	date, err := db.Calendar.Field("end_date")
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
