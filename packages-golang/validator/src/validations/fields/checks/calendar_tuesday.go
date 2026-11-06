package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [tuesday]
  - Presence: Required
  - Type: Boolean

# Description

Indicates whether service is available on Tuesday.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func TuesdayValidation(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "calendar", []string{"tuesday"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the value

		value, err := queries.Field(row.Source, "tuesday")
		if err != nil {
			return err
		}

		//
		// 3. Validate value is present

		if value == "" {
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
