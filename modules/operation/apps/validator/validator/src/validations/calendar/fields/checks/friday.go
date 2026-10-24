package calendar_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [friday]
  - Presence: Required
  - Type: Boolean

# Description

Indicates whether service is available on Friday.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func FridayValidation(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "calendar_friday_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("friday", "calendar.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the value

	value, err := db.Calendar.Field("friday")
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
