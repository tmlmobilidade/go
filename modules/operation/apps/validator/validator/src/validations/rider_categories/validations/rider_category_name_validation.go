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

	// 1. Validate rider_category_name is present
	if riderCategory.RiderCategoryName == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate rider_category_name is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}
}
