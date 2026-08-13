package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllAvailableStandingValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetValidIntOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("available_standing") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var availableStanding *int
			if tc.Name == "Invalid_Value" {
				availableStanding = &invalidOptions[0]
			} else if tc.Value != nil {
				availableStanding = &validOptions[1]
			} else {
				availableStanding = nil
			}
			vehicle := &types.Vehicle{AvailableStanding: availableStanding}
			validations.AvailableStandingValidation(vehicle, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
