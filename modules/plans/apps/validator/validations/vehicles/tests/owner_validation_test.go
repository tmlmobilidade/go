package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllOwnerValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("owner") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			vehicle := &types.Vehicle{Owner: tc.Value}

			if tc.Name == "Invalid_Value" {
				vehicle.Owner = nil
			}

			validations.OwnerValidation(vehicle, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
