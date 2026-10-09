package rider_categories_test

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/rider_categories/validations"
	"testing"
)

func TestAllRiderCategoryNameValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("rider_category_name") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			severity := types.SEVERITY_ERROR
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			}
			riderCategoryName := tc.Value
			if tc.Name == "Invalid_Value" {
				riderCategoryName = nil
			}
			riderCategory := &types.RiderCategory{RiderCategoryName: riderCategoryName}
			validations.RiderCategoryNameValidation(riderCategory, tc.Row, &types.RiderCategoriesRules{RiderCategoryName: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("rider_category_name") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			validations.RiderCategoryNameValidation(&types.RiderCategory{RiderCategoryName: nil}, tc.Row, &types.RiderCategoriesRules{RiderCategoryName: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, lib.IfThenElse(tc.Severity == types.SEVERITY_ERROR, tc.ExpectedErrors, tc.ExpectedWarnings), tc.Name, tc.Severity)
		})
	}
}
