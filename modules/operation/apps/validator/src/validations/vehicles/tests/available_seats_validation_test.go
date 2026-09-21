package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllAvailableSeatsValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetValidIntOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("available_seats") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var availableSeats *int
			if tc.Name == "Invalid_Value" {
				availableSeats = &invalidOptions[0]
			} else if tc.Value != nil {
				availableSeats = &validOptions[1]
			} else {
				availableSeats = nil
			}
			vehicle := &types.Vehicle{AvailableSeats: availableSeats}
			validations.AvailableSeatsValidation(vehicle, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
