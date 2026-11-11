package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [rider_categories.txt]
  - Field: rider_category_name
  - Presence: Required
  - Type: Text

# Description

Public-facing name of the rider category.

[rider_categories.txt]: https://gtfs.org/documentation/schedule/reference/#rider_categoriestxt
*/
func RiderCategoryNameField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "rider_categories", []string{"rider_category_name"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the rider_category_name value

		value, err := queries.Field(row.Source, "rider_category_name")
		if err != nil {
			return err
		}

		//
		// 3. Check if the rider_category_name is required

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
