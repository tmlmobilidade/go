package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
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
func CalendarDateValid(ctx *context.ValidationContext) error {
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
		// 3. Validate start_date is before end_date

		if startDate != "" && endDate != "" && startDate >= endDate {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", startDate))
		}

		//
		// 4. Return success

		return nil
	})
}
