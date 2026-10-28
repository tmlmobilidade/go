package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"strconv"
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
func TransferDurationValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "fare_attributes_transfer_duration_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("transfer_duration", "fare_attributes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the transfer_duration value

	value, err := db.FareAttributes.Field("transfer_duration")
	if err != nil {
		return err
	}

	//
	// 4. Convert the transfer_duration value to a number

	number, parseErr := strconv.Atoi(value)
	if parseErr != nil || number < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 5. Return success

	return nil
}
