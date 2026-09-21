package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllWheelchairValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetBinaryValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("wheelchair", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var wheelchairValue *int
			if tc.Name == "Invalid_Option" {
				wheelchairValue = &invalidOptions[0]
			} else if tc.Value != nil {
				wheelchairValue = &validOptions[0]
			} else {
				wheelchairValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				wheelchairValue = nil
			}

			validations.WheelchairValidation(&types.Vehicle{Wheelchair: wheelchairValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
