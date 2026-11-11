package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: price
  - Presence: Required
  - Type: Non-negative float

# Description

Non-negative fare amount expressed in the currency identified by currency_type.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func PriceField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "fare_attributes", []string{"price"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the price value

		value, err := queries.Field(row.Source, "price")
		if err != nil {
			return err
		}

		//
		// 3. Check if the price is required

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
