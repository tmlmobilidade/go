package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/services/sqlite/queries"
	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/context"
)

// PatternIdSameShapeId checks the pattern_id and shape_id fields for equality.
func PatternIdSameShapeId(ctx *types.ValidationContext) error {
	//

	//
	// 1. Select the fields needed for this comparison inside the rule

	return context.ForEachRow(ctx, "trips", []string{"pattern_id", "shape_id"}, func(row *types.ValidationContext) error {
		values, err := queries.Fields(row.Source, "pattern_id", "shape_id")
		if err != nil {
			return err
		}

		//
		// 2. Compare populated IDs using the scoped configuration

		if values["pattern_id"] == "" || values["shape_id"] == "" || context.ShouldIgnore(row) {
			return nil
		}
		if values["pattern_id"] != values["shape_id"] {
			context.AddMessage(row, context.GetTranslatedMessage(row, "not_matching", values["pattern_id"], values["shape_id"]))
		}
		return nil
	})
}
