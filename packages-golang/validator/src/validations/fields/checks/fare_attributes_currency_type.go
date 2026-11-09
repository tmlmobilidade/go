package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: currency_type
  - Presence: Required
  - Type: Currency code

# Description

ISO 4217 currency code used for the fare price.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func CurrencyTypeField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "fare_attributes", []string{"currency_type"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the currency_type value

		value, err := queries.Field(row.Source, "currency_type")
		if err != nil {
			return err
		}

		//
		// 3. Check if the currency_type is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
