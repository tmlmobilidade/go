package fare_attributes_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [fare_attributes.txt]
  - Field: transfers
  - Presence: Required
  - Type: Enum

# Description

Indicates the number of transfers permitted on this fare. Valid options are:

  - 0 - No transfers permitted on this fare.
  - 1 - Riders may transfer once.
  - 2 - Riders may transfer twice.
  - empty - Unlimited transfers are permitted.

[fare_attributes.txt]: https://gtfs.org/schedule/reference/#fare_attributestxt
*/
func TransfersField(db *services.SQLiteContext, rules *types.FareAttributesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "fare_attributes_transfers_field"
	
	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("transfers", "fare_attributes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}
	
	//
	// 3. Get the transfers value

	value, err := db.FareAttributes.Field("transfers")
	if err != nil {
		return err
	}

	//
	// 4. Check if the transfers is required

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
