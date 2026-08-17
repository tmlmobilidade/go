package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllOnboardMonitorValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetBinaryValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("onboard_monitor", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var onboardMonitorValue *int
			if tc.Name == "Invalid_Option" {
				onboardMonitorValue = &invalidOptions[0]
			} else if tc.Value != nil {
				onboardMonitorValue = &validOptions[0]
			} else {
				onboardMonitorValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				onboardMonitorValue = nil
			}

			validations.OnboardMonitorValidation(&types.Vehicle{OnboardMonitor: onboardMonitorValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
