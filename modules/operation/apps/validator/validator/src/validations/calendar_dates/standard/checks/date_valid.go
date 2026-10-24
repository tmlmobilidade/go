package calendar_dates_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [calendar_dates.txt]
  - Field: date
  - Presence: Required
  - Type: Date

# Description

Date when service exception occurs.
*/
func DateValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule ID

	const ruleID = "calendar_dates_date_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("date", "calendar_dates.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the date value

	date, err := db.CalendarDates.Field("date")
	if err != nil {
		return err
	}

	//
	// 4. Validate date is a valid service date

	if !lib.IsValidServiceDate(date) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", date))
		return nil
	}

	//
	// 5. Return success

	return nil
}
