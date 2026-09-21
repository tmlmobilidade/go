package calendar

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/calendar/validations"
	"testing"
)

func TestAllDateValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetDateValidOptions()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("start_date") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var date string
			if tc.Value != nil {
				date = validOptions[0]
			} else {
				date = ""
			}

			if tc.Name == "Invalid_Value" {
				date = ""
			}

			validations.DateValidation(date, "start_date", tc.Row)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
