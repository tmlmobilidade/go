package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/utils"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: pattern_id
  - Presence: Recommended
  - Type: ID

# Description

The `pattern_id` must be the same as the `shape_id`, so that the pattern identifier matches the shape referenced by the trip.

Trips without `shape_id` or `pattern_id` are left alone: there is nothing to compare, and their own rules already report the problem.
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
