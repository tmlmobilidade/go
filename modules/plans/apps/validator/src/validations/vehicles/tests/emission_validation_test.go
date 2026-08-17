package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllEmissionValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetEmissionValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("emission", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var emissionValue *int
			if tc.Name == "Invalid_Option" {
				emissionValue = &invalidOptions[0]
			} else if tc.Value != nil {
				emissionValue = &validOptions[0]
			} else {
				emissionValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				emissionValue = nil
			}

			validations.EmissionValidation(&types.Vehicle{Emission: emissionValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
