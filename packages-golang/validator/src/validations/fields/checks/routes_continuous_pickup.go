package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func RoutesContinuousPickupField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "routes", []string{"continuous_pickup"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the continuous_pickup value

		value, err := queries.Field(row.Source, "continuous_pickup")
		if err != nil {
			return err
		}

		//
		// 3. Check if the continuous_pickup is required

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
