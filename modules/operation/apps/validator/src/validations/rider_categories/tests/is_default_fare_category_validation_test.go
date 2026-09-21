package rider_categories_test

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/rider_categories/validations"
	"testing"
)

func TestAllIsDefaultFareCategoryValidationTests(t *testing.T) {
	validOptions := []int{0, 1}
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("is_default_fare_category", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var isDefaultFareCategory *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok && ptr != nil {
					isDefaultFareCategory = ptr
				}
			}
			validations.IsDefaultFareCategoryValidation(&types.RiderCategory{IsDefaultFareCategory: isDefaultFareCategory}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	t.Run("Invalid_Value", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.IsDefaultFareCategoryValidation(&types.RiderCategory{IsDefaultFareCategory: lib.Ptr(2)}, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_Value", types.SEVERITY_ERROR)
	})
}
