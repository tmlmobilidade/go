package rider_categories_test

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/rider_categories/validations"
	"testing"
)

func TestAllEligibilityUrlValidationTests(t *testing.T) {
	for _, tc := range test_helpers.GetGenericUrlTestCases("eligibility_url") {
		if tc.Name == "Required_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			validations.EligibilityUrlValidation(&types.RiderCategory{EligibilityUrl: tc.Url}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
