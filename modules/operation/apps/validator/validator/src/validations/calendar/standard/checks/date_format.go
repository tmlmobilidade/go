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
func DateValidFormat(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "calendar_start_end_dates_valid_format"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("dates", "calendar.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	if ctx.ShouldIgnore() {
		return nil
	}

	//
	// 3. Get the date value

	startDate, err := db.Calendar.Field("start_date")
	if err != nil {
		return err
	}

	endDate, err := db.Calendar.Field("end_date")
	if err != nil {
		return err
	}

	//
	// 5. Validate date is a valid service date

	if !lib.IsValidServiceDate(startDate) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", startDate))
	}

	if !lib.IsValidServiceDate(endDate) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", endDate))
	}

	//
	// 6. Return success

	return nil
}
