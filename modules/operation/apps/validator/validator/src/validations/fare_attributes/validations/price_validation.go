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
func PriceValidation(fareAttribute *types.FareAttribute, row int, rules *types.FareAttributesRules) {
	ctx := lib.NewValidationContext("price", "fare_attributes.txt", "fare_price_valid_non_negative_decimal", row, services.AppMessageService)
	if rules != nil && rules.Price.Severity != "" {
		ctx.WithSeverity(rules.Price.Severity)
	}

	// 1. Validate price is present
	if fareAttribute.Price == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("price_validation.required", "price_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate price is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("price_validation.forbidden"))
		return
	}

	// 3. Validate price is a valid price
	if *fareAttribute.Price < 0 {
		ctx.AddError(ctx.GetTranslatedMessage("price_validation.invalid", *fareAttribute.Price))
		return
	}
}
