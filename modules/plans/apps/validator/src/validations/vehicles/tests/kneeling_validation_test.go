package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllKneelingValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetThreeStateValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("kneeling", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var kneelingValue *int
			if tc.Name == "Invalid_Option" {
				kneelingValue = &invalidOptions[0]
			} else if tc.Value != nil {
				kneelingValue = &validOptions[0]
			} else {
				kneelingValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				kneelingValue = nil
			}

			validations.KneelingValidation(&types.Vehicle{Kneeling: kneelingValue}, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
