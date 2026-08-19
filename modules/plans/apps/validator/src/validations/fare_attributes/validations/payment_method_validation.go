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
func PaymentMethodValidation(fareAttribute *types.FareAttribute, row int) {
	ctx := lib.NewValidationContext("payment_method", "fare_attributes.txt", "payment_method_valid_gtfs_enum", row, services.AppMessageService)

	if fareAttribute.PaymentMethod == nil {
		ctx.AddError(ctx.GetTranslatedMessage("payment_method_validation.required"))
		return
	}

	validPaymentMethods := []int{0, 1}
	if !slices.Contains(validPaymentMethods, *fareAttribute.PaymentMethod) {
		ctx.AddError(ctx.GetTranslatedMessage("payment_method_validation.invalid", *fareAttribute.PaymentMethod))
		return
	}
}
