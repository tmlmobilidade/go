package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: trip_headsign
  - Presence: Optional
  - Type: Text

# Description

Destination text displayed to riders for the trip. Use stop_times.stop_headsign when the displayed destination
changes during the trip.

Presence and type follow [GTFS Standard].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#tripstxt
*/
func TripHeadsignField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "trips", []string{"trip_headsign"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the trip_headsign value

		value, err := queries.Field(row.Source, "trip_headsign")
		if err != nil {
			return err
		}

		//
		// 3. Check if the trip_headsign is required

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
