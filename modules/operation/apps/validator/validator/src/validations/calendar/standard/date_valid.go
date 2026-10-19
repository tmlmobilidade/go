package calendar_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [start_date, end_date]
  - Presence: Required
  - Type: Date

# Description

Start service day for the service interval.

End service day for the service interval. This service day is included in the interval.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func DateValid(db *services.SQLiteContext, dateType string, rules *types.CalendarRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "calendar_start_end_dates_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext(dateType, "calendar.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the date value

	date, err := db.Calendar.Field(dateType)
	if err != nil {
		return err
	}

	//
	// 4. Validate date is a valid service date

	if !lib.IsValidServiceDate(date) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", date))
	}

	//
	// 5. Return success

	return nil
}
