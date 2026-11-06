package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func RoutesContinuousDropOffField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "routes", []string{"continuous_drop_off"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the continuous_drop_off value

		value, err := queries.Field(row.Source, "continuous_drop_off")
		if err != nil {
			return err
		}

		//
		// 3. Check if the continuous_drop_off is required

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
