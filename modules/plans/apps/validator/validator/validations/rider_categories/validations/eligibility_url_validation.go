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
	ctx := lib.NewValidationContext("eligibility_url", "rider_categories.txt", "eligibility_url_valid_http_url", row, services.AppMessageService)
	if rules != nil && rules.EligibilityUrl.Severity != "" {
		ctx.WithSeverity(rules.EligibilityUrl.Severity)
	}

	// Validate presence - optional field, so nil is valid
	if riderCategory.EligibilityUrl == nil {
		return
	}

	// Validate URL
	if !lib.ValidateUrl(*riderCategory.EligibilityUrl) {
		ctx.AddError(ctx.GetTranslatedMessage("eligibility_url_validation.invalid"))
		return
	}
}
