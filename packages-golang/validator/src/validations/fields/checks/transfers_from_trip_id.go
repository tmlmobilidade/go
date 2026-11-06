package fields

import (
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
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
func FromTripIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "transfers", []string{"from_trip_id", "transfer_type"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the from_trip_id value

		value, err := queries.Field(row.Source, "from_trip_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the from_trip_id validation should run

		if value != "" || context.ShouldIgnore(row) {
			return nil
		}

		//
		// 4. Get the transfer_type value

		kind, err := queries.Field(row.Source, "transfer_type")
		if err != nil {
			return err
		}

		//
		// 5. Convert the from_trip_id to an integer

		transferType, _ := strconv.Atoi(kind)

		//
		// 6. Check the from_trip_id required

		if transferType == 4 || transferType == 5 {
			context.AddMessage(row, context.GetTranslatedMessage(row, "required"))
		} else {
			context.AddMessage(row, context.GetTranslatedMessage(row, "recommended"))
		}

		//
		// 7. Return success

		return nil
	})
}
