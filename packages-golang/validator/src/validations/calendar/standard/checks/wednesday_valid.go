package calendar_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [wednesday]
  - Presence: Required
  - Type: Boolean

# Description

Indicates whether service is available on Wednesday.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func WednesdayValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "calendar_wednesday_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("wednesday", "calendar.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the value

	value, err := db.Calendar.Field("wednesday")
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
