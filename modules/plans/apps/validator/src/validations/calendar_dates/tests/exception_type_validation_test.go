package calendar_dates

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/calendar_dates/validations"
	"testing"
)

func TestAllExceptionTypeValidationTestCases(t *testing.T) {
	// exception_type is GTFS enum 1 (add) or 2 (remove), not a 0/1 binary field
	validOptions := []int{1, 2}
	dateValid := test_helpers.GetDateValidOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("exception_type", validOptions) {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var exceptionType *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok {
					exceptionType = ptr
				}
			}
			if tc.Name == "Missing_Value_Required" {
				exceptionType = lib.Ptr(0)
			}

			calendarDate := &types.CalendarDates{
				Date:          dateValid[0],
				ExceptionType: exceptionType,
				ServiceId:     "S1",
			}

			validations.ExceptionTypeValidation(calendarDate, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
