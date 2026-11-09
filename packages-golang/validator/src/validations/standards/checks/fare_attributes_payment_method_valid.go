package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: payment_method
  - Presence: Required
  - Type: Enum

# Description

Specifies when payment is required: 0 for payment on board or 1 for payment before boarding.

Validation: Checks that the populated value represents an integer in 0, 1. Matching uses the parsed integer rather
than its original spelling. Configured value lists are not applied. Empty values are skipped; required-field checks
handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func PaymentMethodValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "fare_attributes", []string{"payment_method"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "payment_method")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Convert the payment_method value to a number

		number, parseErr := strconv.Atoi(value)
		if parseErr != nil || number < 0 || number > 1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 3. Return success

		return nil
	})
}
