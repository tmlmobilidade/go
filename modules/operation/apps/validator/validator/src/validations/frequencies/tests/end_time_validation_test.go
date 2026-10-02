package frequencies

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/frequencies/validations"
	"testing"
)

func TestAllEndTimeValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetValidTimeOptions()
	invalidOptions := test_helpers.GetInvalidTimeOptions()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("end_time") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var endTime string
			if tc.Name == "Invalid_Value" {
				endTime = invalidOptions[4]
			} else if tc.Value != nil {
				endTime = validOptions[0]
			} else {
				endTime = ""
			}

			frequency := &types.Frequencies{EndTime: &endTime}

			validations.EndTimeValidation(frequency, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
