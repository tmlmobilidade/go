package calendar_fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
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
func StartDateValidation(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "calendar_start_date_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("start_date", "calendar.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the date value

	date, err := db.Calendar.Field("start_date")
	if err != nil {
		return err
	}

	//
	// 4. Validate date is present

	if date == "" {
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
