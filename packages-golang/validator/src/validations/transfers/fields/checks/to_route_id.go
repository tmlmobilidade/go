package transfers_fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: to_route_id
  - Presence: optional
  - Type: Foreign ID referencing routes.route_id

# Description

Identifies a route where a connection begins.

If to_route_id is defined, the transfer will apply to the departing trip on the route for the given to_stop_id.

If both to_trip_id and to_route_id are defined, the trip_id must belong to the route_id, and to_trip_id will take precedence.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/
func ToRouteIdField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "transfers_to_route_id_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("to_route_id", "transfers.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the to_route_id value

	value, err := db.Transfers.Field("to_route_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the to_route_id validation should run

	if value != "" || ctx.ShouldIgnore() {
		return nil
	}

	//
	// 5. Get the to_trip_id value

	trip, err := db.Transfers.Field("to_trip_id")
	if err != nil {
		return err
	}

	//
	// 6. Check if the trip reference already identifies the route

	// A trip reference can identify the route on its own.
	if trip != "" {
		return nil
	}

	//
	// 7. Report the missing field with the configured severity

	ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("recommended"))

	//
	// 8. Return success

	return nil
}
