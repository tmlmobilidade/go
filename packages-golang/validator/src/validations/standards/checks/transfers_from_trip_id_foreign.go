package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
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
func FromTripIdForeign(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "transfers", "trips")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "transfers", []string{"from_trip_id", "from_route_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		//
		// 2. Get the from_route_id, from_trip_id values

		fields, err := queries.Fields(rowCtx.Source, "from_route_id", "from_trip_id")
		if err != nil {
			return err
		}

		//
		// 3. Get the from_trip_id value

		value := fields["from_trip_id"]

		//
		// 4. Skip empty from_trip_id values

		if value == "" {
			return nil
		}

		//
		// 5. Check if the from_trip_id reference exists

		referenceExists1, err := queries.Exists(&sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "trips"}, "trip_id", value)
		if err != nil {
			return err
		}
		if !referenceExists1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_found", value))
			return nil
		}

		//
		// 6. Get the trip and route references

		tripID, routeID := fields["from_trip_id"], fields["from_route_id"]

		//
		// 7. Skip empty from_trip_id values

		if tripID == "" || routeID == "" {
			return nil
		}

		//
		// 8. Check if the from_trip_id reference exists

		referenceExists2, err := queries.Exists(&sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "trips"}, "trip_id", tripID)
		if err != nil {
			return err
		}
		if !referenceExists2 {
			return nil
		}

		//
		// 9. Get the trips table

		trips := &sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "trips"}
		seen := false

		//
		// 10. Collect the matching rows

		err = queries.ForEachMatchingFields(trips, "trip_id", []any{tripID}, []string{"route_id"}, func(row *sqliteTypes.SQLiteRow, lookupValues map[string]string) error {
			row.Values = lookupValues
			if seen {
				return nil
			}
			seen = true
			route, err := queries.Field(row, "route_id")
			if err != nil {
				return err
			}
			if route != "" && route != routeID {
				context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "trip_must_belong_to_route", tripID, routeID, route))
			}
			return nil
		})
		if err != nil {
			return err
		}

		//
		// 11. Return success

		return nil
	})
}
