package rider_categories

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [rider_categories.txt]
  - Field: rider_category_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a rider category.

[rider_categories.txt]: https://gtfs.org/schedule/reference/#rider_categoriestxt
*/

func RiderCategoryIdValidation(riderCategory *types.RiderCategory, row int, gtfs *types.Gtfs, rules *types.RiderCategoriesRules) {
	ctx := lib.NewValidationContext("rider_category_id", "rider_categories.txt", "rider_category_id_unique", row, services.AppMessageService)
	if rules != nil && rules.RiderCategoryId.Severity != "" {
		ctx.WithSeverity(rules.RiderCategoryId.Severity)
	}

	// 1. Validate rider_category_id is present
	if riderCategory.RiderCategoryId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("rider_category_id_validation.required", "rider_category_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate rider_category_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("rider_category_id_validation.forbidden"))
		return
	}

	// 3. Validate rider_category_id is a valid rider_category_id
	rows, err := gtfs.GetRowsById("rider_categories", *riderCategory.RiderCategoryId)
	if err == nil && len(rows) > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("rider_category_id_validation.duplicate", *riderCategory.RiderCategoryId))
		return
	}

}
