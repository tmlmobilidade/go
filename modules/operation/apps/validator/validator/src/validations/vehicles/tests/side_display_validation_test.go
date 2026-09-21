package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllSideDisplayValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetThreeStateValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("side_display", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var sideDisplayValue *int
			if tc.Name == "Invalid_Option" {
				sideDisplayValue = &invalidOptions[0]
			} else if tc.Value != nil {
				sideDisplayValue = &validOptions[0]
			} else {
				sideDisplayValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				sideDisplayValue = nil
			}

			validations.SideDisplayValidation(&types.Vehicle{SideDisplay: sideDisplayValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
