package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
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
func ToRouteIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "transfers", []string{"to_route_id", "to_trip_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the to_route_id value

		value, err := queries.Field(row.Source, "to_route_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the to_route_id validation should run

		if value != "" || context.ShouldIgnore(row) {
			return nil
		}

		//
		// 4. Get the to_trip_id value

		trip, err := queries.Field(row.Source, "to_trip_id")
		if err != nil {
			return err
		}

		//
		// 5. Check if the trip reference already identifies the route

		// A trip reference can identify the route on its own.
		if trip != "" {
			return nil
		}

		//
		// 6. Report the missing field with the configured severity

		context.AddMessage(row, context.GetTranslatedMessage(row, "recommended"))

		//
		// 7. Return success

		return nil
	})
}
