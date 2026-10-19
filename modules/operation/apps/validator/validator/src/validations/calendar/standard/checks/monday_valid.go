package calendar_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [monday]
  - Presence: Required
  - Type: Boolean

# Description

Indicates whether service is available on Monday.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func MondayValid(db *services.SQLiteContext, rules *types.CalendarRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "calendar_monday_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("monday", "calendar.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the value

	value, err := db.Calendar.Field("monday")
	if err != nil {
		return err
	}

	//
	// 4. Validate value is valid

	if value != "0" && value != "1" {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 5. Return success

	return nil
}