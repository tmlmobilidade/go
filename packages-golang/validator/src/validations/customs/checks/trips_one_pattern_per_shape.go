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
  - Field: [shape_id, pattern_id]
  - Presence: Conditionally Required, Configurable
  - Type: Foreign ID referencing shapes.shape_id, ID

# Description

Allows at most one populated pattern_id for each non-empty shape_id.

Validation: Groups trips by shape_id, counts distinct non-empty pattern_id strings and reports groups with more
than one. Matching preserves whitespace and letter case. Missing values and reference validity are left to other
checks.

Rows with an empty shape_id are not grouped. The comparison is skipped when this rule is configured as forbidden.
Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [trips.txt].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
*/
func OnePatternPerShape(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "trips", "shape_id", []string{"shape_id"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Check if the shape_id validation should run

		if context.ShouldSkip(rowCtx) {
			return nil
		}

		//
		// 3. Get the shape_id value

		shape, err := queries.Field(rowCtx.Source, "shape_id")
		if err != nil {
			return err
		}

		//
		// 4. Collect the patterns associated with this shape

		patterns := map[string]bool{}

		//
		// 6. Collect shape_id values for the shape_id group

		err = validationutils.ForGroupFields(rowCtx, "shape_id", []string{"pattern_id"}, func(_ *sqliteTypes.SQLiteRow, fields map[string]string) error {
			value := fields["pattern_id"]
			if value != "" {
				patterns[value] = true
			}
			return nil
		})
		if err != nil {
			return err
		}

		//
		// 7. Check the shape_id multiple shape id in unique pattern id

		if len(patterns) > 1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "multiple_shape_id_in_unique_pattern_id", shape))
		}

		//
		// 8. Return success

		return nil
	})
}
