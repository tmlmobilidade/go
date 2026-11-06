package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

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
