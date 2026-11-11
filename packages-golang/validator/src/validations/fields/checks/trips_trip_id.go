package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: trip_id
  - Presence: Required
  - Type: Unique ID

# Description

Unique identifier for a trip.

Presence and type follow [GTFS Standard].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#tripstxt
*/
func TripsTripIdField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "trips", []string{"trip_id"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the trip_id value

		value, err := queries.Field(row.Source, "trip_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the trip_id is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
