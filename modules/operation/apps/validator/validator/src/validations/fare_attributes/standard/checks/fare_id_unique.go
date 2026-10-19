package fare_attributes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: fare_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a fare class.

[fare_attributes.txt]: https://gtfs.org/schedule/reference/#fare_attributestxt
*/
func FareIdUnique(db *services.SQLiteContext, rules *types.FareAttributesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "fare_attributes_id_unique"
	
	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("fare_id", "fare_attributes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the fare_id value

	value, count, err := db.FareAttributes.FieldWithCount("fare_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the fare_id is unique

	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
	}

	//
	// 5. Return success

	return nil
}
