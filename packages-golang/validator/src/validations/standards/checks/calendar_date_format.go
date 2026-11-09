package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
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

Validation: Checks each populated date independently for an existing date in YYYYMMDD format. Both invalid dates
can be reported on one row. It does not compare their order.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[calendar.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#calendartxt
*/
func DateValidFormat(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "calendar", []string{"start_date", "end_date"}, func(rowCtx *context.ValidationContext) error {
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
		// 3. Validate date is a valid service date

		if startDate != "" && !validators.IsValidServiceDate(startDate) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", startDate))
		}

		if endDate != "" && !validators.IsValidServiceDate(endDate) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", endDate))
		}

		//
		// 4. Return success

		return nil
	})
}
