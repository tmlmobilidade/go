package fare_attributes_fields

import (
	"main/lib"
	"main/services"
	"main/types"
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
func PaymentMethodField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "fare_attributes_payment_method_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("payment_method", "fare_attributes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the payment_method value

	value, err := db.FareAttributes.Field("payment_method")
	if err != nil {
		return err
	}

	//
	// 4. Check if the payment_method is required

	if value == "" {
		if ctx.ShouldIgnore() {
			return nil
		}
		ctx.AddMessageWithSeverity(ctx.GetSeverityMessage("required", "recommended", "informational"))
		return nil
	}

	//
	// 5. Return success

	return nil
}
