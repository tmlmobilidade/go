package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
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

Presence and type follow [GTFS Standard].

[calendar_dates.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar-dates
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#calendar_datestxt
*/
func DateField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "calendar_dates", []string{"date"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the date value

		date, err := queries.Field(row.Source, "date")
		if err != nil {
			return err
		}

		//
		// 3. Validate date is present

		if date == "" {
			if context.ShouldSkip(row) {
				return nil
			}

			message := context.GetRequiredMessage(row, "required", "recommended")
			context.AddMessage(row, message)
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
