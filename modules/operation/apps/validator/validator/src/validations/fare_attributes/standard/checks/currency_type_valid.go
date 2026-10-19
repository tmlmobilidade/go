package fare_attributes_standard

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
func CurrencyTypeValid(db *services.SQLiteContext, rules *types.FareAttributesRules) error {
	//
	
	//
	// 1. Get the rule

	const ruleID = "fare_attributes_currency_type_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("currency_type", "fare_attributes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the currency_type value

	value, err := db.FareAttributes.Field("currency_type")
	if err != nil {
		return err
	}

	//
	// 4. Validate currency_type is valid

	if !lib.ValidateCurrencyType(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 5. Return success

	return nil
}
