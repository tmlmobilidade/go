package calendar_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [saturday]
  - Presence: Required
  - Type: Boolean

# Description

Indicates whether service is available on Saturday.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func SaturdayValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "calendar_saturday_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("saturday", "calendar.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the value

	value, err := db.Calendar.Field("saturday")
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
