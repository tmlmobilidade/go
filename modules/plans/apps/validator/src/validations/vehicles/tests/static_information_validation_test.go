package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllStaticInformationValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetBinaryValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("static_information", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var staticInformationValue *int
			if tc.Name == "Invalid_Option" {
				staticInformationValue = &invalidOptions[0]
			} else if tc.Value != nil {
				staticInformationValue = &validOptions[0]
			} else {
				staticInformationValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				staticInformationValue = nil
			}

			validations.StaticInformationValidation(&types.Vehicle{StaticInformation: staticInformationValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
