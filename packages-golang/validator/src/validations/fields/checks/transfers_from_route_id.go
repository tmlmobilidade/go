package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [transfers.txt]
  - Field: from_route_id
  - Presence: Optional
  - Type: Foreign ID referencing routes.route_id

# Description

Identifies the arriving route to which the transfer applies. When from_trip_id is also supplied, that trip must
belong to this route and takes precedence.

[transfers.txt]: https://gtfs.org/documentation/schedule/reference/#transferstxt
*/
func FromRouteIdField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "transfers", []string{"from_route_id", "from_trip_id"}, func(row *contextTypes.ValidationContext) error {
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
