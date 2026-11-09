package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: [pattern_id, shape_id]
  - Presence: Configurable, Conditionally Required
  - Type: ID, Foreign ID referencing shapes.shape_id

# Description

Allows at most one populated shape_id for each non-empty pattern_id.

Validation: Groups trips by pattern_id, counts distinct non-empty shape_id strings and reports groups with more
than one. Matching preserves whitespace and letter case. Missing values and reference validity are left to other
checks.

Rows with an empty pattern_id are not grouped. The comparison is skipped when this rule is configured as forbidden.
Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [trips.txt].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
*/
func OneShapePerPattern(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "trips", "pattern_id", []string{"shape_id", "pattern_id"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Check if the shape_id validation should run

		if context.ShouldSkip(rowCtx) {
			return nil
		}

		//
		// 3. Get the pattern_id value

		pattern, err := queries.Field(rowCtx.Source, "pattern_id")
		if err != nil {
			return err
		}

		//
		// 4. Collect the shapes associated with this pattern

		shapes := map[string]bool{}

		//
		// 5. Collect shape_id values for the pattern_id group

		err = validationutils.ForGroupFields(rowCtx, "pattern_id", []string{"shape_id"}, func(_ *sqliteTypes.SQLiteRow, fields map[string]string) error {
			value := fields["shape_id"]
			if value != "" {
				shapes[value] = true
			}
			return nil
		})
		if err != nil {
			return err
		}

		//
		// 6. Check if all trips in the pattern use the same shape_id

		if len(shapes) > 1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "different_shape_id", pattern))
		}

		//
		// 7. Return success

		return nil
	})
}
