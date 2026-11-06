package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/utils"
)

// OnePatternPerShape checks its own groups; dependencies control cross-rule suppression.
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
