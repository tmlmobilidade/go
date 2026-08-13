package rider_categories_test

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/rider_categories/validations"
	"testing"
)

func TestParseRiderCategories(t *testing.T) {
	services.AppMessageService.Clear()
	row := 1
	raw := types.RiderCategoryRaw{
		EligibilityUrl:        "https://www.example.com",
		RiderCategoryId:       "RC1",
		RiderCategoryName:     "Adult",
		IsDefaultFareCategory: "1",
	}
	validations.ParseRiderCategories(raw, row)
	test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "ParseRiderCategories_ValidInput", types.SEVERITY_ERROR)
	test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "ParseRiderCategories_ValidInput", types.SEVERITY_WARNING)
}

func TestParseRiderCategories_InvalidTypes(t *testing.T) {
	services.AppMessageService.Clear()
	row := 2
	raw := types.RiderCategoryRaw{
		EligibilityUrl:        "https://www.example.com",
		RiderCategoryId:       "RC1",
		RiderCategoryName:     "Adult",
		IsDefaultFareCategory: "not_an_int",
	}
	validations.ParseRiderCategories(raw, row)
	test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "ParseRiderCategories_InvalidTypes", types.SEVERITY_ERROR)
}
