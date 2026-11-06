package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
)

func ShapePtSequenceField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "shapes", []string{"shape_pt_sequence"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the shape_pt_sequence value

		value, err := queries.Field(row.Source, "shape_pt_sequence")
		if err != nil {
			return err
		}

		//
		// 3. Check if the shape_pt_sequence is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
