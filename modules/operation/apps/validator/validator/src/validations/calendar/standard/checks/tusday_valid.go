package calendar_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [tusday]
  - Presence: Required
  - Type: Boolean

# Description

Indicates whether service is available on Tusday.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func TusdayValid(db *services.SQLiteContext, rules *types.CalendarRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "calendar_tuesday_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("tuesday", "calendar.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the value

	value, err := db.Calendar.Field("tuesday")
	if err != nil {
		return err
	}

	//
	// 4. Validate value is valid

	if value != "0" && value != "1" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 5. Return success

	return nil
}
