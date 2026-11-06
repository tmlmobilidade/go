package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: [thursday]
  - Presence: Required
  - Type: Boolean

# Description

Indicates whether service is available on Thursday.

[calendar.txt]: https://gtfs.org/schedule/reference/#calendartxt
*/
func ThursdayValidation(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "calendar", []string{"thursday"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the value

		value, err := queries.Field(row.Source, "thursday")
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
