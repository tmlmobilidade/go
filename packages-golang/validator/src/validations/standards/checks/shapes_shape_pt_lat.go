package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func ShapePtLatField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "shapes", []string{"shape_pt_lat"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the shape_pt_lat value

		value, err := queries.Field(row.Source, "shape_pt_lat")
		if err != nil {
			return err
		}

		//
		// 3. Check if the shape_pt_lat is required

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
