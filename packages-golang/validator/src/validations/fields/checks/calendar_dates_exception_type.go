package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes
  - File: [calendar_dates.txt]
  - Field: exception_type
  - Presence: Required
  - Type: Enum

# Description

Indicates whether service is available on the date specified in the date field.
*/
func ExceptionTypeField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "calendar_dates", []string{"exception_type"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the exception_type value

		exceptionType, err := queries.Field(row.Source, "exception_type")
		if err != nil {
			return err
		}

		//
		// 3. Validate exception_type is present

		if exceptionType == "" {
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
