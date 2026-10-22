package transfers_standard

import (
	"main/lib"
	"main/services"
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
func ToRouteIdValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	// 1. Create the validation context.
	const ruleID = "transfer_to_route_id_references_routes_table"
	ctx := lib.NewValidationContext("to_route_id", "transfers.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	// 2. Read references from the current transfer row.
	fields, err := db.Transfers.Fields("to_route_id", "to_trip_id")
	if err != nil {
		return err
	}
	value := fields["to_route_id"]
	if value == "" {
		return nil
	}
	if !db.Routes.Exists("route_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
		return nil
	}
	// 3. When both references exist, the first trip definition must use this route.
	tripID, routeID := fields["to_trip_id"], fields["to_route_id"]
	if tripID == "" || routeID == "" {
		return nil
	}
	if !db.Trips.Exists("trip_id", tripID) {
		return nil
	}
	trips, err := db.Table("trips")
	if err != nil {
		return err
	}
	seen := false
	err = trips.ForEachMatching("trip_id", tripID, func(row *services.SQLiteRow) error {
		if seen {
			return nil
		}
		seen = true
		route, err := row.Field("route_id")
		if err != nil {
			return err
		}
		if route != "" && route != routeID {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("trip_must_belong_to_route", tripID, routeID, route))
		}
		return nil
	})
	if err != nil {
		return err
	}

	return nil
}
