package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllConsumptionMeterValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetBinaryValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("consumption_meter", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var consumptionMeterValue *int
			if tc.Name == "Invalid_Option" {
				consumptionMeterValue = &invalidOptions[0]
			} else if tc.Value != nil {
				consumptionMeterValue = &validOptions[0]
			} else {
				consumptionMeterValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				consumptionMeterValue = nil
			}

			validations.ConsumptionMeterValidation(&types.Vehicle{ConsumptionMeter: consumptionMeterValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
