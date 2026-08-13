package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllExternalSoundValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetBinaryValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("external_sound", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var externalSoundValue *int
			if tc.Name == "Invalid_Option" {
				externalSoundValue = &invalidOptions[0]
			} else if tc.Value != nil {
				externalSoundValue = &validOptions[0]
			} else {
				externalSoundValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				externalSoundValue = nil
			}

			validations.ExternalSoundValidation(&types.Vehicle{ExternalSound: externalSoundValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
