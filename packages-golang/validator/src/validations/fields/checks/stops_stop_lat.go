package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_lat
  - Presence: Conditionally Required
  - Type: Latitude

# Description

WGS84 latitude of the location in decimal degrees. For boarding locations, use the actual boarding point on the
sidewalk or platform rather than the vehicle's position on the road or track.

Conditionally Required:
  - Required for locations which are stops (`location_type=0`), stations (`location_type=1`) or entrances/exits
    (`location_type=2`).
  - Optional for locations which are generic nodes (`location_type=3`) or boarding areas (`location_type=4`).

Presence and type follow [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func StopLatField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stops", []string{"stop_lat"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the stop_lat value

		value, err := queries.Field(row.Source, "stop_lat")
		if err != nil {
			return err
		}

		//
		// 3. Check if the stop_lat is present

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
