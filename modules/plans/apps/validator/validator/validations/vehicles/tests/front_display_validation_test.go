package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllFrontDisplayValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetThreeStateValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("front_display", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var frontDisplayValue *int
			if tc.Name == "Invalid_Option" {
				frontDisplayValue = &invalidOptions[0]
			} else if tc.Value != nil {
				frontDisplayValue = &validOptions[0]
			} else {
				frontDisplayValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				frontDisplayValue = nil
			}

			validations.FrontDisplayValidation(&types.Vehicle{FrontDisplay: frontDisplayValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
