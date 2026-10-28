package transfers_fields

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: to_stop_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing stops.stop_id

# Description

Identifies a stop (location_type=0) or a station (location_type=1) where a connection between routes ends.
If this field refers to a station, the transfer rule applies to all its child stops. It must refer to a stop (location_type=0) if transfer_type is 4 or 5.

Conditionally Required:
- Required if transfer_type is 1, 2, or 3.
- Optional if transfer_type is 4 or 5.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/
func ToStopIdField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "transfers_to_stop_id_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("to_stop_id", "transfers.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the to_stop_id value

	value, err := db.Transfers.Field("to_stop_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the to_stop_id validation should run

	if value != "" || ctx.ShouldIgnore() {
		return nil
	}

	//
	// 5. Get the transfer_type value

	kind, err := db.Transfers.Field("transfer_type")
	if err != nil {
		return err
	}

	//
	// 6. Convert the transfer_type to an integer

	transferType, err := strconv.Atoi(kind)

	//
	// 7. Check if the transfer type requires to_stop_id

	// Stop IDs are required only for types 1, 2 and 3.
	if err != nil || transferType < 1 || transferType > 3 {
		return nil
	}

	//
	// 8. Report the missing field with the configured severity

	ctx.AddMessageWithSeverity(ctx.GetSeverityMessage("required", "recommended", "informational"))

	//
	// 9. Return success

	return nil
}
