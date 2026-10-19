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
	// 1. Get the rule

	const ruleID = "calendar_sunday_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("sunday", "calendar.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the value

	value, err := db.Calendar.Field("sunday")
	if err != nil {
		return err
	}

	//
	// 4. Validate value is present

	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetSeverityMessage("required", "recommended", "informational")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 5. Return success

	return nil
}
