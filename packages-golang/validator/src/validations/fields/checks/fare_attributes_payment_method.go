package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: payment_method
  - Presence: Required
  - Type: Enum

# Description

Specifies when payment is required: 0 for payment on board or 1 for payment before boarding.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func PaymentMethodField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "fare_attributes", []string{"payment_method"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the payment_method value

		value, err := queries.Field(row.Source, "payment_method")
		if err != nil {
			return err
		}

		//
		// 3. Check if the payment_method is required

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
