package fare_attributes_fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
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
func CurrencyTypeField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "fare_attributes_currency_type_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("currency_type", "fare_attributes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the currency_type value

	value, err := db.FareAttributes.Field("currency_type")
	if err != nil {
		return err
	}

	//
	// 4. Check if the currency_type is required

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
