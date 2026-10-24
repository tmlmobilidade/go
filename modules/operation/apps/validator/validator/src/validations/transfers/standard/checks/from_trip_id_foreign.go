package transfers_standard

import (
	"main/lib"
	"main/services"
	"main/types"
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
func FromTripIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "transfers_from_trip_id_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("from_trip_id", "transfers.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the from_route_id, from_trip_id values

	fields, err := db.Transfers.Fields("from_route_id", "from_trip_id")
	if err != nil {
		return err
	}

	//
	// 4. Get the from_trip_id value

	value := fields["from_trip_id"]

	//
	// 5. Skip empty from_trip_id values

	if value == "" {
		return nil
	}

	//
	// 6. Check if the from_trip_id reference exists

	if !db.Trips.Exists("trip_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
		return nil
	}

	//
	// 7. Get the trip and route references

	tripID, routeID := fields["from_trip_id"], fields["from_route_id"]

	//
	// 8. Skip empty from_trip_id values

	if tripID == "" || routeID == "" {
		return nil
	}

	//
	// 9. Check if the from_trip_id reference exists

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
