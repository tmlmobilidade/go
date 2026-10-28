package calendar_dates_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
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
func ExceptionTypeValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule ID

	const ruleID = "calendar_dates_exception_type_valid"

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
	// 4. Validate exception_type is a valid exception type

	validExceptionTypes := []int{1, 2}
	exceptionTypeInt, err := strconv.Atoi(exceptionType)
	if err != nil || !slices.Contains(validExceptionTypes, exceptionTypeInt) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", exceptionType))
		return nil
	}

	//
	// 5. Return success

	return nil
}
