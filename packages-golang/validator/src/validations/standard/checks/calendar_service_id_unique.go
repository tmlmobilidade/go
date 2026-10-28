package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [service_id]
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a set of dates when service is available for one or more routes.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func ServiceIdUnique(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "calendar_service_id_unique"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("service_id", "calendar.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get service_id and its occurrence count in calendar

	value, count, err := db.Calendar.FieldWithCount("service_id")
	if err != nil {
		return err
	}

	// 4. Validate service_id is unique
	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
	}

	// 5. Return success

	return nil
}
