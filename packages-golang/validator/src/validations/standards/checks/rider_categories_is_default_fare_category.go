package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func IsDefaultFareCategoryField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "rider_categories", []string{"is_default_fare_category"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the is_default_fare_category value

		value, err := queries.Field(row.Source, "is_default_fare_category")
		if err != nil {
			return err
		}

		//
		// 3. Check if the is_default_fare_category is required

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
