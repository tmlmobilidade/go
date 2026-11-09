package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: [pattern_id, shape_id]
  - Presence: Configurable, Conditionally Required
  - Type: ID, Foreign ID referencing shapes.shape_id

# Description

Keeps the pattern identifier equal to the shape identifier on the same trip.

Validation: Skips comparison when either identifier is empty. Otherwise requires exact text equality, preserving
whitespace and letter case. It does not check whether the shape exists.

Example: pattern_id=1001_0_1 and shape_id=1001_0_1 pass.

The comparison is skipped when this rule is configured as forbidden. Unavailable source or lookup tables skip the
check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [trips.txt].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
*/
func PatternIdSameShapeId(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "trips", []string{"pattern_id", "shape_id"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Get the pattern_id, shape_id values

		values, err := queries.Fields(rowCtx.Source, "pattern_id", "shape_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the pattern_id validation should run

		if values["pattern_id"] == "" || values["shape_id"] == "" || context.ShouldSkip(rowCtx) {
			return nil
		}

		//
		// 4. Check if pattern_id matches the shape_id

		if values["pattern_id"] != values["shape_id"] {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_matching", values["pattern_id"], values["shape_id"]))
		}

		//
		// 5. Return success

		return nil
	})
}
