package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [rider_categories.txt]
  - Field: is_default_fare_category
  - Presence: Required
  - Type: Enum

# Description

Marks the default rider category with 1; 0 or empty means another category. Each fare product with multiple
eligible categories must have exactly one eligible default category.

[rider_categories.txt]: https://gtfs.org/documentation/schedule/reference/#rider_categoriestxt
*/
func IsDefaultFareCategoryField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "rider_categories", []string{"is_default_fare_category"}, func(row *contextTypes.ValidationContext) error {
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
