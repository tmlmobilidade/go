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
func CurrencyTypeValidation(fareAttribute *types.FareAttribute, row int, rules *types.FareAttributesRules) {
	ctx := lib.NewValidationContext("currency_type", "fare_attributes.txt", "fare_attributes_currency_type_valid", row, services.AppMessageService)
	if rules != nil && rules.CurrencyType.Severity != "" {
		ctx.WithSeverity(rules.CurrencyType.Severity)
	}

	// 1. Validate currency_type is present
	if fareAttribute.CurrencyType == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate currency_type is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate currency_type is a valid currency type
	if !lib.ValidateCurrencyType(*fareAttribute.CurrencyType) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", *fareAttribute.CurrencyType))
		return
	}
}
