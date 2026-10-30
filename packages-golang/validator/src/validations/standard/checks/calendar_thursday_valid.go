package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [thursday]
  - Presence: Required
  - Type: Boolean

# Description

Indicates whether service is available on Thursday.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func ThursdayValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "calendar_thursday_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("thursday", "calendar.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the value

	value, err := db.Calendar.Field("thursday")
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
