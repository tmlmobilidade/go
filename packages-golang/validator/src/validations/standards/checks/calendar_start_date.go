package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [start_date]
  - Presence: Required
  - Type: Date

# Description

Start service day for the service interval.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func StartDateValidation(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "calendar", []string{"start_date"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the date value

		date, err := queries.Field(row.Source, "start_date")
		if err != nil {
			return err
		}

		//
		// 3. Validate date is present

		if date == "" {
			if context.ShouldSkip(row) {
				return nil
			}

			message := context.GetSeverityMessage(row, "required", "recommended", "informational")
			context.AddMessage(row, message)
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
