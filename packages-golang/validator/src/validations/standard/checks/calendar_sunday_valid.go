package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
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
func SundayValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "calendar_sunday_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("sunday", "calendar.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the value

	value, err := db.Calendar.Field("sunday")
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
