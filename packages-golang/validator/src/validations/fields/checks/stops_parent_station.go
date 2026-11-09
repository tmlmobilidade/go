package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: parent_station
  - Presence: Conditionally Required
  - Type: Foreign ID referencing stops.stop_id

# Description

Identifies the parent location. Stops, entrances and generic nodes reference a station; boarding areas reference a
platform. A station must not itself have a parent_station.

Conditionally Required:
  - Required for locations which are entrances (`location_type=2`), generic nodes (`location_type=3`) or boarding
    areas (`location_type=4`).
  - Optional for stops/platforms (`location_type=0`).
  - Forbidden for stations (`location_type=1`).

Presence and type follow [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func ParentStationField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stops", []string{"parent_station"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the parent_station value

		value, err := queries.Field(row.Source, "parent_station")
		if err != nil {
			return err
		}

		//
		// 3. Check if the parent_station is present

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			message := context.GetSeverityMessage(row, "required", "recommended", "informational")
			context.AddMessage(row, message)
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
