package rider_categories_test

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/rider_categories/validations"
	"testing"
)

func TestAllRiderCategoryNameValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("rider_category_name") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			if tc.Name == "Invalid_Value" {
				tc.Value = nil
			}
			riderCategory := &types.RiderCategory{RiderCategoryName: tc.Value}
			validations.RiderCategoryNameValidation(riderCategory, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("rider_category_name") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			validations.RiderCategoryNameValidation(&types.RiderCategory{RiderCategoryName: nil}, tc.Row, &types.RiderCategoriesRules{RiderCategoryName: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, tc.Severity)
		})
	}
}
