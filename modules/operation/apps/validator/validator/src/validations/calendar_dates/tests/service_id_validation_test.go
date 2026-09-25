package calendar_dates

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/calendar_dates/validations"
	"testing"
)

func TestAllServiceIdValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetDateValidOptions()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("service_id") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var serviceId string
			if tc.Value != nil {
				serviceId = validOptions[0]
			} else {
				serviceId = ""
			}
			calendarDate := &types.CalendarDates{
				Date:          validOptions[0],
				ExceptionType: nil,
				ServiceId:     serviceId,
			}

			if tc.Name == "Invalid_Value" {
				calendarDate = &types.CalendarDates{}
			}

			validations.ServiceIdValidation(calendarDate, tc.Row)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
