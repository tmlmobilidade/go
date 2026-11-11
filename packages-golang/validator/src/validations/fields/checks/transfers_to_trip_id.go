package fields

import (
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [transfers.txt]
  - Field: to_trip_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing trips.trip_id

# Description

Identifies the departing trip to which the transfer applies. When to_route_id is also supplied, the trip must
belong to that route and takes precedence over it.

Conditionally Required:
- Required if `transfer_type` is `4` or `5`.
- Optional otherwise.

[transfers.txt]: https://gtfs.org/documentation/schedule/reference/#transferstxt
*/
func ToTripIdField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "transfers", []string{"to_trip_id", "transfer_type"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the to_trip_id value

		value, err := queries.Field(row.Source, "to_trip_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the to_trip_id validation should run

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
		// 5. Convert the to_trip_id to an integer

		transferType, _ := strconv.Atoi(kind)

		//
		// 6. Check the to_trip_id required

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
