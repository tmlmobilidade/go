package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllRearDisplayValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetThreeStateValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("rear_display", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var rearDisplayValue *int
			if tc.Name == "Invalid_Option" {
				rearDisplayValue = &invalidOptions[0]
			} else if tc.Value != nil {
				rearDisplayValue = &validOptions[0]
			} else {
				rearDisplayValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				rearDisplayValue = nil
			}

			validations.RearDisplayValidation(&types.Vehicle{RearDisplay: rearDisplayValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
