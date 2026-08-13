package rider_categories

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes

  - File: [rider_categories.txt]
  - Field: is_default_fare_category
  - Presence: required
  - Type: enum

# Description

Specifies if an entry in rider_categories.txt should be considered the default category (i.e. the main category that should be displayed to riders).

For example: Adult fare, Regular fare, etc. Valid options are:

	0 or empty - Category is not considered the default.
	1 - Category is considered the default one.

When multiple rider categories are eligible for a single fare product specified by a fare_product_id, there must be exactly one of these eligible rider categories indicated as the default rider category (is_default_fare_category = 1).

[rider_categories.txt]: https://gtfs.org/schedule/reference/#rider_categoriestxt
*/

func IsDefaultFareCategoryValidation(riderCategory *types.RiderCategory, row int, rules *types.RiderCategoriesRules) {
	ctx := lib.NewValidationContext("is_default_fare_category", "rider_categories.txt", "at_most_one_default_fare_category", row, services.AppMessageService)
	if rules != nil && rules.IsDefaultFareCategory.Severity != "" {
		ctx.WithSeverity(rules.IsDefaultFareCategory.Severity)
	} else {
		ctx.WithSeverity(types.SEVERITY_WARNING)
	}

	// Validate presence
	if riderCategory.IsDefaultFareCategory == nil {
		ctx.AddError(ctx.GetTranslatedMessage("is_default_fare_category_validation.required"))
		return
	}

	// Validate enum
	validOptions := []int{0, 1}
	if !slices.Contains(validOptions, *riderCategory.IsDefaultFareCategory) {
		ctx.AddError(ctx.GetTranslatedMessage("is_default_fare_category_validation.invalid"))
		return
	}

	// Validate rules
	if rules != nil && rules.IsDefaultFareCategory.Options != nil {
		if slices.Contains(*rules.IsDefaultFareCategory.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.IsDefaultFareCategory.Options, strconv.Itoa(*riderCategory.IsDefaultFareCategory)) {
			ctx.AddError(ctx.GetTranslatedMessage("is_default_fare_category_validation.not_allowed", *riderCategory.IsDefaultFareCategory))
			return
		}
	}
}
