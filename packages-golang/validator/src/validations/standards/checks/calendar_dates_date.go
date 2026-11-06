package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
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
func DateField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "calendar_dates", []string{"date"}, func(row *context.ValidationContext) error {
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
