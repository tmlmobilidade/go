package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllInternalSoundValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetBinaryValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("internal_sound", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var internalSoundValue *int
			if tc.Name == "Invalid_Option" {
				internalSoundValue = &invalidOptions[0]
			} else if tc.Value != nil {
				internalSoundValue = &validOptions[0]
			} else {
				internalSoundValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				internalSoundValue = nil
			}

			validations.InternalSoundValidation(&types.Vehicle{InternalSound: internalSoundValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
