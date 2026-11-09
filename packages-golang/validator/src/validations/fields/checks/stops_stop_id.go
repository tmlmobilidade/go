package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a stop, platform, station, entrance, generic node or boarding area. It must also be distinct from
identifiers in locations.geojson and location_groups.txt.

Presence and type follow [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func StopsStopIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stops", []string{"stop_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the stop_id value

		value, err := queries.Field(row.Source, "stop_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the stop_id is present

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
