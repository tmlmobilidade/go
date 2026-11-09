package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"math"
	"strconv"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: price
  - Presence: Required
  - Type: Non-negative float

# Description

Fare price, in the unit specified by currency_type.

[fare_attributes.txt]: https://gtfs.org/schedule/reference/#fare_attributestxt
*/
func PriceValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "fare_attributes", []string{"price"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "price")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Convert the price value to a number

		number, parseErr := strconv.ParseFloat(value, 64)
		if parseErr != nil || math.IsNaN(number) || math.IsInf(number, 0) || number < 0 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 3. Return success

		return nil
	})
}
