package fare_attributes

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: payment_method
  - Presence: Required
  - Type: Enum

# Description

Indicates when the fare must be paid.

Valid options are:

  - 0 - Fare is paid on board.
  - 1 - Fare must be paid before boarding.

[fare_attributes.txt]: https://gtfs.org/schedule/reference/#fare_attributestxt
*/
func PaymentMethodValidation(fareAttribute *types.FareAttribute, row int, rules *types.FareAttributesRules) {
	ctx := lib.NewValidationContext("payment_method", "fare_attributes.txt", "fare_attributes_payment_method_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.PaymentMethod.Severity != "" {
		ctx.WithSeverity(rules.PaymentMethod.Severity)
	}

	// 1. Validate payment_method is present
	if fareAttribute.PaymentMethod == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("payment_method_validation.required", "payment_method_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate payment_method is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("payment_method_validation.forbidden"))
		return
	}

	// 3. Validate payment_method is a valid payment method
	validPaymentMethods := []int{0, 1}
	if !slices.Contains(validPaymentMethods, *fareAttribute.PaymentMethod) {
		ctx.AddError(ctx.GetTranslatedMessage("payment_method_validation.invalid", *fareAttribute.PaymentMethod))
		return
	}
}
