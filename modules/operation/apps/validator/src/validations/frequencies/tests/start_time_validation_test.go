package frequencies

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/frequencies/validations"
	"testing"
)

func TestAllStartTimeValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetValidTimeOptions()
	invalidOptions := test_helpers.GetInvalidTimeOptions()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("start_time") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var startTime string
			if tc.Name == "Invalid_Value" {
				startTime = invalidOptions[4]
			} else if tc.Value != nil {
				startTime = validOptions[0]
			} else {
				startTime = ""
			}

			frequency := &types.Frequencies{StartTime: &startTime}

			validations.StartTimeValidation(frequency, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
