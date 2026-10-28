package calendar_fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
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
func WednesdayValidation(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "calendar_wednesday_field"

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
