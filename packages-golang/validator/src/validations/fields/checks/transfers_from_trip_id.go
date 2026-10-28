package fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"strconv"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: from_trip_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing trips.trip_id

# Description

Identifies a trip where a connection between routes begins.

If from_trip_id is defined, the transfer will apply to the arriving trip for the given from_stop_id.

If both from_trip_id and from_route_id are defined, the trip_id must belong to the route_id, and from_trip_id will take precedence.

Conditionally Required:
- Required if transfer_type is 4 or 5.
- Optional otherwise.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/
func FromTripIdField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "transfers_from_trip_id_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("from_trip_id", "transfers.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the from_trip_id value

	value, err := db.Transfers.Field("from_trip_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the from_trip_id validation should run

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
	// 6. Convert the from_trip_id to an integer

	transferType, _ := strconv.Atoi(kind)

	//
	// 7. Check the from_trip_id required

	if transferType == 4 || transferType == 5 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("required"))
	} else {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("recommended"))
	}

	//
	// 8. Return success

	return nil
}
