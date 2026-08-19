package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllBicyclesValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetBinaryValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("bicycles", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var bicyclesValue *int
			if tc.Name == "Invalid_Option" {
				bicyclesValue = &invalidOptions[0]
			} else if tc.Value != nil {
				bicyclesValue = &validOptions[0]
			} else {
				bicyclesValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				bicyclesValue = nil
			}

			validations.BicyclesValidation(&types.Vehicle{Bicycles: bicyclesValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
