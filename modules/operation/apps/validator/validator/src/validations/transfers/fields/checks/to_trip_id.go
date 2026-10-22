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
  - Field: to_trip_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing trips.trip_id

# Description

Identifies a trip where a connection between routes begins.

If to_trip_id is defined, the transfer will apply to the arriving trip for the given to_stop_id.

If both to_trip_id and to_route_id are defined, the trip_id must belong to the route_id, and to_trip_id will take precedence.

Conditionally Required:
- Required if transfer_type is 4 or 5.
- Optional otherwise.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/
func ToTripIdField(db *services.SQLiteContext, rules *types.RuleContext) error {
	// 1. Create the validation context.
	const ruleID = "transfers_to_trip_id_field"
	ctx := lib.NewValidationContext("to_trip_id", "transfers.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	// 2. Read current SQLite values. Presence is independent of value validation.
	value, err := db.Transfers.Field("to_trip_id")
	if err != nil {
		return err
	}
	if value != "" || ctx.ShouldIgnore() {
		return nil
	}
	kind, err := db.Transfers.Field("transfer_type")
	if err != nil {
		return err
	}
	transferType, _ := strconv.Atoi(kind)
	if transferType == 4 || transferType == 5 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("required"))
	} else {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("recommended"))
	}

	return nil
}
