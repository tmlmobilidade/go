package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllLoweredFloorValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetThreeStateValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("lowered_floor", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var loweredFloorValue *int
			if tc.Name == "Invalid_Option" {
				loweredFloorValue = &invalidOptions[0]
			} else if tc.Value != nil {
				loweredFloorValue = &validOptions[0]
			} else {
				loweredFloorValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				loweredFloorValue = nil
			}

			validations.LoweredFloorValidation(&types.Vehicle{LoweredFloor: loweredFloorValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
