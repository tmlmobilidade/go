package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
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
func TripsShapeIdField(ctx *types.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "trips", []string{"shape_id"}, func(row *types.ValidationContext) error {
		//
		// 2. Read the current source value

		value, err := queries.Field(row.Source, "shape_id")
		if err != nil {
			return err
		}

		//
		// 3. Report missing values using this context's configuration and rule ID

		if value == "" && !context.ShouldIgnore(row) {
			context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))
		}
		return nil
	})
}
