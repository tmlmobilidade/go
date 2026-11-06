package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func ShapePtLonField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "shapes", []string{"shape_pt_lon"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the shape_pt_lon value

		value, err := queries.Field(row.Source, "shape_pt_lon")
		if err != nil {
			return err
		}

		//
		// 3. Check if the shape_pt_lon is required

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
