package calendar_dates

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/calendar_dates/validations"
	"testing"
)

func TestAllDateValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetDateValidOptions()
	invalidOptions := test_helpers.GetInvalidDateOptions()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("date") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var date string
			if tc.Name == "Invalid_Value" {
				date = invalidOptions[0]
			} else if tc.Value != nil {
				date = validOptions[0]
			}
			validations.DateValidation(&types.CalendarDates{Date: date}, tc.Row)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
