package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: trip_short_name
  - Presence: Optional
  - Type: Text

# Description

Short public-facing identifier for the trip, such as a train number, when this differs from trip_headsign. It
should be unique within a service day.

Presence and type follow [GTFS Standard].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#tripstxt
*/
func TripShortNameField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "trips", []string{"trip_short_name"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the trip_short_name value

		value, err := queries.Field(row.Source, "trip_short_name")
		if err != nil {
			return err
		}

		//
		// 3. Check if the trip_short_name is required

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
