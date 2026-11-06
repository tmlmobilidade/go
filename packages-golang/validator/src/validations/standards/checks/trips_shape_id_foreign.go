package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

// ShapeIdForeign checks that trip shape IDs exist in shapes.
// Missing lookup tables skip the rule, even without a file-presence dependency.
func ShapeIdForeign(ctx *context.ValidationContext) error {
	//

	//
	// 1. Skip when the lookup table is unavailable

	exists, err := queries.TableExists(ctx.DB, "shapes")
	if err != nil {
		return err
	}
	if !exists {
		ctx.Skipped = true
		return nil
	}
	shapes := &sqliteTypes.SQLiteTable{DB: ctx.DB, Name: "shapes"}

	//
	// 2. Read each trip's shape ID

	return context.ForEachRow(ctx, "trips", []string{"shape_id"}, func(row *context.ValidationContext) error {
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
