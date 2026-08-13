package fare_attributes

import (
	"main/lib"
	"main/services"
	"main/types"
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
func PriceValidation(fareAttribute *types.FareAttribute, row int) {
	ctx := lib.NewValidationContext("price", "fare_attributes.txt", "fare_price_valid_non_negative_decimal", row, services.AppMessageService)

	if fareAttribute.Price == nil {
		ctx.AddError(ctx.GetTranslatedMessage("price_validation.required"))
		return
	}

	if *fareAttribute.Price < 0 {
		ctx.AddError(ctx.GetTranslatedMessage("price_validation.invalid", *fareAttribute.Price))
	}
}
