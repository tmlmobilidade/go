package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_access
  - Presence: Conditionally Forbidden
  - Type: Enum

# Description

Specifies access to a platform: 0 through the station and its entrances or pathways, 1 directly from the street
network or empty for unspecified access.

Conditionally Forbidden:
  - Forbidden for locations which are stations (`location_type=1`), entrances (`location_type=2`), generic nodes
    (`location_type=3`) or boarding areas (`location_type=4`).
  - Forbidden if `parent_station` is empty.
  - Optional otherwise.

Presence and type follow [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func StopAccessField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stops", []string{"stop_access"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the stop_access value

		value, err := queries.Field(row.Source, "stop_access")
		if err != nil {
			return err
		}

		//
		// 3. Check if the stop_access is present

		if value == "" {
			if context.ShouldSkip(row) {
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
