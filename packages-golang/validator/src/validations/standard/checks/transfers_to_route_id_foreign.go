package standard

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
func ToRouteIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "transfers_to_route_id_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("to_route_id", "transfers.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the to_route_id, to_trip_id values

	fields, err := db.Transfers.Fields("to_route_id", "to_trip_id")
	if err != nil {
		return err
	}

	//
	// 4. Get the to_route_id value

	value := fields["to_route_id"]

	//
	// 5. Skip empty to_route_id values

	if value == "" {
		return nil
	}

	//
	// 6. Check if the to_route_id reference exists

	if !db.Routes.Exists("route_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
		return nil
	}

	//
	// 7. Get the trip and route references

	tripID, routeID := fields["to_trip_id"], fields["to_route_id"]

	//
	// 8. Skip empty to_route_id values

	if tripID == "" || routeID == "" {
		return nil
	}

	//
	// 9. Check if the to_route_id reference exists

	if !db.Trips.Exists("trip_id", tripID) {
		return nil
	}

	//
	// 10. Get the trips table

	trips, err := db.Table("trips")
	if err != nil {
		return err
	}
	seen := false

	//
	// 11. Collect the matching rows

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

	//
	// 12. Return success

	return nil
}
