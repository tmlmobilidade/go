package rider_categories_test

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/rider_categories/validations"
	"testing"
)

func TestAllRiderCategoryIdValidationTests(t *testing.T) {
	for _, tc := range test_helpers.GetGenericIdTestCases("rider_category_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			riderCategory := &types.RiderCategory{RiderCategoryId: tc.Id}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"rider_categories": tc.ExistingIds}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			validations.RiderCategoryIdValidation(riderCategory, tc.Row, gtfs, &types.RiderCategoriesRules{RiderCategoryId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("rider_category_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			riderCategory := &types.RiderCategory{RiderCategoryId: nil}
			validations.RiderCategoryIdValidation(riderCategory, tc.Row, nil, &types.RiderCategoriesRules{RiderCategoryId: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, tc.Severity)
		})
	}
}
