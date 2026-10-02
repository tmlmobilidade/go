package rider_categories

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [rider_categories.txt]
  - Field: eligibility_url
  - Presence: optional
  - Type: URL

# Description

URL of a web page, usually from the operating agency, that provides detailed information about a specific rider category and/or describes its eligibility criteria.

[rider_categories.txt]: https://gtfs.org/schedule/reference/#rider_categoriestxt
*/

func EligibilityUrlValidation(riderCategory *types.RiderCategory, row int, rules *types.RiderCategoriesRules) {
	ctx := lib.NewValidationContext("eligibility_url", "rider_categories.txt", "rider_categories_eligibility_url_valid_http_url", row, services.AppMessageService)
	if rules != nil && rules.EligibilityUrl.Severity != "" {
		ctx.WithSeverity(rules.EligibilityUrl.Severity)
	}

	// 1. Validate eligibility_url is present
	if riderCategory.EligibilityUrl == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate eligibility_url is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate eligibility_url is a valid eligibility_url
	if !lib.ValidateUrl(*riderCategory.EligibilityUrl) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid"))
		return
	}
}
