package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: shape_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing shapes.shape_id

# Description

Identifies the shape describing the trip's travel path.

Conditionally Required:
  - Required if the trip has a continuous pickup or drop-off behavior defined either in routes.txt or in
    stop_times.txt.
  - Optional otherwise.

Presence and type follow [GTFS Standard].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#tripstxt
*/
func TripsShapeIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "trips", []string{"shape_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the shape_id value

		value, err := queries.Field(row.Source, "shape_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the shape_id is required

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
