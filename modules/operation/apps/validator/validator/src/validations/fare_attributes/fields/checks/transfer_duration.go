package fare_attributes_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [fare_attributes.txt]
  - Field: transfer_duration
  - Presence: Optional
  - Type: Non-negative integer

# Description

Length of time in seconds before a transfer expires. When transfers=0 this field may be used to indicate how long a ticket is valid for or it may be left empty.

[fare_attributes.txt]: https://gtfs.org/schedule/reference/#fare_attributestxt
*/
func TransferDurationField(db *services.SQLiteContext, rules *types.FareAttributesRules) error {
	//
		
	//
	// 1. Get the rule

	const ruleID = "fare_attributes_transfer_duration_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("transfer_duration", "fare_attributes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}
	
	//
	// 3. Get the transfer_duration value

	value, err := db.FareAttributes.Field("transfer_duration")
	if err != nil {
		return err
	}

	//
	// 4. Check if the transfer_duration is required

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
