package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

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
