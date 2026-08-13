package rider_categories

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [rider_categories.txt]
  - Field: rider_category_name
  - Presence: required
  - Type: text

# Description

Rider category name as displayed to the rider.

[rider_categories.txt]: https://gtfs.org/schedule/reference/#rider_categoriestxt
*/

func RiderCategoryNameValidation(riderCategory *types.RiderCategory, row int, rules *types.RiderCategoriesRules) {
	ctx := lib.NewValidationContext("rider_category_name", "rider_categories.txt", "rider_category_name_non_empty", row, services.AppMessageService)
	if rules != nil && rules.RiderCategoryName.Severity != "" {
		ctx.WithSeverity(rules.RiderCategoryName.Severity)
	}

	// Validate presence
	if riderCategory.RiderCategoryName == nil {
		ctx.AddError(ctx.GetTranslatedMessage("rider_category_name_validation.required"))
		return
	}
}
