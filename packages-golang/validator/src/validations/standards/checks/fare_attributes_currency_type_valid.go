package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: currency_type
  - Presence: Required
  - Type: Currency code

# Description

Currency used to pay the fare.

[fare_attributes.txt]: https://gtfs.org/schedule/reference/#fare_attributestxt
*/
func CurrencyTypeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "fare_attributes", []string{"currency_type"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "currency_type")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Validate currency_type is valid

		if !validators.ValidateCurrencyType(value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 3. Return success

		return nil
	})
}
