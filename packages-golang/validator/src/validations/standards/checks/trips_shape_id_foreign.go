package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
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
func ShapeIdForeign(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "trips", "shapes")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "trips", []string{"shape_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "shape_id")
		if err != nil {
			return err
		}

		//
		// 2. Requiredness is checked by the field rule.

		if value == "" {
			return nil
		}

		//
		// 3. Check if the shape_id exists in the shapes table

		referenceExists1, err := queries.Exists(&sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "shapes"}, "shape_id", value)
		if err != nil {
			return err
		}
		if !referenceExists1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_found", value))
		}

		//
		// 4. Return success

		return nil
	})
}
