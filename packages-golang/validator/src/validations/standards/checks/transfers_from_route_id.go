package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
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
func FromRouteIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "transfers", []string{"from_route_id", "from_trip_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the from_route_id value

		value, err := queries.Field(row.Source, "from_route_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the from_route_id validation should run

		if value != "" || context.ShouldIgnore(row) {
			return nil
		}

		//
		// 4. Get the from_trip_id value

		trip, err := queries.Field(row.Source, "from_trip_id")
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
