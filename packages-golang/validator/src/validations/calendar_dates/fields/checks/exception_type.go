package calendar_dates_fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

/*
# Attributes
  - File: [calendar_dates.txt]
  - Field: exception_type
  - Presence: Required
  - Type: Enum

# Description

Indicates whether service is available on the date specified in the date field.
*/
func ExceptionTypeField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule ID

	const ruleID = "calendar_dates_exception_type_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("exception_type", "calendar_dates.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the exception_type value

	exceptionType, err := db.CalendarDates.Field("exception_type")
	if err != nil {
		return err
	}

	//
	// 4. Validate exception_type is present

	if exceptionType == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 5. Return success

	return nil
}
