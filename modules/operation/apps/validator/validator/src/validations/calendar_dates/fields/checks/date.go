package calendar_dates_fields

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

[calendar_dates.txt]: https://gtfs.org/schedule/reference/#calendar_datestxt
*/
func DateField(db *services.SQLiteContext, rules *types.CalendarDatesRules) error {
	//

	//
	// 1. Get the rule ID

	const ruleID = "calendar_dates_date_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("date", "calendar_dates.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the date value

	date, err := db.CalendarDates.Field("date")
	if err != nil {
		return err
	}

	//
	// 4. Validate date is present

	if date == "" {
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
