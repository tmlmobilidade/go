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

	// Validate presence
	if riderCategory.RiderCategoryId == nil {
		ctx.AddError(ctx.GetTranslatedMessage("rider_category_id_validation.required"))
		return
	}

	rows, err := gtfs.GetRowsById("rider_categories", *riderCategory.RiderCategoryId)
	if err == nil && len(rows) > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("rider_category_id_validation.duplicate", map[string]interface{}{"rider_category_id": *riderCategory.RiderCategoryId}))
		return
	}

}
