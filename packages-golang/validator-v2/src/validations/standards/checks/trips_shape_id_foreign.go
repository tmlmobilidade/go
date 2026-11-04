package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
)

// ShapeIdForeign owns its source and related-table requirements.
func ShapeIdForeign(ctx *context.ValidationContext) error {
	//

	//
	// 1. Require the lookup table without changing graph dependencies

	if !context.HasTable(ctx, "shapes") {
		ctx.Skipped = true
		return nil
	}

	//
	// 2. Read the trip shape ID after Kahn releases this rule

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

		exists, err := queries.Exists(row.Tables.Tables["shapes"], "shape_id", value)
		if err != nil {
			return err
		}
		if !exists {
			context.AddMessage(row, context.GetTranslatedMessage(row, "not_found", value))
		}
		return nil
	})
}
