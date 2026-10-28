package transfers_fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: from_route_id
  - Presence: optional
  - Type: Foreign ID referencing routes.route_id

# Description

Identifies a route where a connection begins.

If from_route_id is defined, the transfer will apply to the arriving trip on the route for the given from_stop_id.

If both from_trip_id and from_route_id are defined, the trip_id must belong to the route_id, and from_trip_id will take precedence.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/
func FromRouteIdField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "transfers_from_route_id_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("from_route_id", "transfers.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the from_route_id value

	value, err := db.Transfers.Field("from_route_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the from_route_id validation should run

	if value != "" || ctx.ShouldIgnore() {
		return nil
	}

	//
	// 5. Get the from_trip_id value

	trip, err := db.Transfers.Field("from_trip_id")
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
