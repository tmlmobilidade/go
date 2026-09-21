package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllPassengerCountingValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetBinaryValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("passenger_counting", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var passengerCountingValue *int
			if tc.Name == "Invalid_Option" {
				passengerCountingValue = &invalidOptions[0]
			} else if tc.Value != nil {
				passengerCountingValue = &validOptions[0]
			} else {
				passengerCountingValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				passengerCountingValue = nil
			}

			validations.PassengerCountingValidation(&types.Vehicle{PassengerCounting: passengerCountingValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
