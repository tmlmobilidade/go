package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllRampValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetFourStateValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("ramp", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var rampValue *int
			if tc.Name == "Invalid_Option" {
				rampValue = &invalidOptions[0]
			} else if tc.Value != nil {
				rampValue = &validOptions[0]
			} else {
				rampValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				rampValue = nil
			}

			validations.RampValidation(&types.Vehicle{Ramp: rampValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
