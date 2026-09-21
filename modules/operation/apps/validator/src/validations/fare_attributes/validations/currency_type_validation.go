package fare_attributes

import (
	"main/lib"
	"main/services"
	"main/types"
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
func CurrencyTypeValidation(fareAttribute *types.FareAttribute, row int) {
	ctx := lib.NewValidationContext("currency_type", "fare_attributes.txt", "currency_type_valid", row, services.AppMessageService)

	if fareAttribute.CurrencyType == nil {
		ctx.AddError(ctx.GetTranslatedMessage("currency_type_validation.required"))
		return
	}

	if !lib.ValidateCurrencyType(*fareAttribute.CurrencyType) {
		ctx.AddError(ctx.GetTranslatedMessage("currency_type_validation.invalid", *fareAttribute.CurrencyType))
		return
	}
}
