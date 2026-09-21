package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllClimatizationValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetBinaryValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("climatization", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var climatizationValue *int
			if tc.Name == "Invalid_Option" {
				climatizationValue = &invalidOptions[0]
			} else if tc.Value != nil {
				climatizationValue = &validOptions[0]
			} else {
				climatizationValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				climatizationValue = nil
			}

			validations.ClimatizationValidation(&types.Vehicle{Climatization: climatizationValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
