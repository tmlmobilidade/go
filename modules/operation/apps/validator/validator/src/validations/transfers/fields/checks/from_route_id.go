package transfers_fields

import (
	"main/lib"
	"main/services"
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
	// 1. Create the validation context.
	const ruleID = "transfers_from_route_id_field"
	ctx := lib.NewValidationContext("from_route_id", "transfers.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	// 2. Read current SQLite values. Presence is independent of value validation.
	value, err := db.Transfers.Field("from_route_id")
	if err != nil {
		return err
	}
	if value != "" || ctx.ShouldIgnore() {
		return nil
	}
	trip, err := db.Transfers.Field("from_trip_id")
	if err != nil {
		return err
	}
	// A trip reference can identify the route on its own.
	if trip != "" {
		return nil
	}
	ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("recommended"))

	return nil
}
