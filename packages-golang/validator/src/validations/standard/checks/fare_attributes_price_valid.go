package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
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
func PriceValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "fare_attributes_price_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("price", "fare_attributes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the price value

	value, err := db.FareAttributes.Field("price")
	if err != nil {
		return err
	}

	//
	// 4. Convert the price value to a number

	number, parseErr := strconv.ParseFloat(value, 64)
	if parseErr != nil || math.IsNaN(number) || math.IsInf(number, 0) || number < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 5. Return success

	return nil
}
