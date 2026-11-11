package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [trips.txt], [shapes.txt]
  - Field: shape_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing shapes.shape_id

# Description

Identifies the shape describing the trip's travel path.

Conditionally Required:
  - Required if the trip has a continuous pickup or drop-off behavior defined either in routes.txt or in
    stop_times.txt.
  - Optional otherwise.

Validation: Checks that each non-empty shape_id exists in shapes.shape_id. It compares the original text without
trimming whitespace or normalizing letter case. The presence of the referenced value is separate from its format.
Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard trips].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
[GTFS Standard trips]: https://gtfs.org/documentation/schedule/reference/#tripstxt
*/
func ShapeIdForeign(ctx *types.ValidationContext) error {
	//

	//
	// 1. Validate the context and skip when required tables are unavailable

	ready, err := context.RequireTables(ctx, "trips", "shapes")
	if err != nil || !ready {
		return err
	}
	shapes := &sqliteTypes.SQLiteTable{DB: ctx.DB, Name: "shapes"}

	//
	// 2. Read each trip's shape ID

	return context.ForEachRow(ctx, "trips", []string{"shape_id"}, func(row *types.ValidationContext) error {
		if context.ShouldIgnore(row) {
			return nil
		}
		value, err := queries.Field(row.Source, "shape_id")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		} // Presence is handled by the field rule.

		//
		// 3. Check the related table and report through the same row context

		exists, err := queries.Exists(shapes, "shape_id", value)
		if err != nil {
			return err
		}
		if !exists {
			context.AddMessage(row, context.GetTranslatedMessage(row, "not_found", value))
		}
		return nil
	})
}
