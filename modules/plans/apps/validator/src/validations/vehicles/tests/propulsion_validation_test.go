package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllPropulsionValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetPropulsionValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("propulsion", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var propulsionValue *int
			if tc.Name == "Invalid_Option" {
				propulsionValue = &invalidOptions[0]
			} else if tc.Value != nil {
				propulsionValue = &validOptions[0]
			} else {
				propulsionValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				propulsionValue = nil
			}

			validations.PropulsionValidation(&types.Vehicle{Propulsion: propulsionValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
