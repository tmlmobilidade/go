package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [start_date, end_date]
  - Presence: Required
  - Type: Date

# Description

- start_date: First service date included in the calendar's date range, written as YYYYMMDD.
- end_date: Last service date included in the calendar's date range, written as YYYYMMDD.

Validation: Compares the two populated date strings and reports start_date greater than or equal to end_date. Equal
dates are rejected by this implementation. Date existence and format are checked separately.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[calendar.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#calendartxt
*/
func CalendarDateValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "calendar", []string{"start_date", "end_date"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		//
		// 2. Get the date value

		startDate, err := queries.Field(rowCtx.Source, "start_date")
		if err != nil {
			return err
		}

		endDate, err := queries.Field(rowCtx.Source, "end_date")
		if err != nil {
			return err
		}

		//
		// 3. Validate start_date is before end_date

		if startDate != "" && endDate != "" && startDate >= endDate {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", startDate))
		}

		//
		// 4. Return success

		return nil
	})
}
