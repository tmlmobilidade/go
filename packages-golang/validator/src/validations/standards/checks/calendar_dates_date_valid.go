package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [calendar_dates.txt]
  - Field: date
  - Presence: Required
  - Type: Date

# Description

Service date on which the exception applies, written as YYYYMMDD.

Validation: Checks for eight characters representing an existing calendar date in YYYYMMDD format. Surrounding
whitespace is not removed. Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[calendar_dates.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar-dates
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#calendar_datestxt
*/
func CalendarDatesDateValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "calendar_dates", []string{"date"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		date, err := queries.Field(rowCtx.Source, "date")
		if err != nil {
			return err
		}
		if date == "" {
			return nil
		}

		//
		// 2. Validate date is a valid service date

		if !validators.IsValidServiceDate(date) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", date))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
