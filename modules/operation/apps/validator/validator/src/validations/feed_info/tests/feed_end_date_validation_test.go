package feed_info

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/feed_info/validations"
	"testing"
)

func TestAllFeedEndDateValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetDateValidOptions()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("feed_end_date") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}

			var feedEndDate *string
			if tc.Value != nil {
				feedEndDate = lib.Ptr(validOptions[0])
			}

			if tc.Name == "Invalid_Value" {
				feedEndDate = lib.Ptr("2023-01-01")
			}

			feedInfo := &types.FeedInfo{FeedEndDate: feedEndDate}
			validations.FeedEndDateValidation(&severity, feedInfo, tc.Row)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("feed_end_date") {
		if tc.Name != "Severity_Ignore_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			feedInfo := &types.FeedInfo{FeedEndDate: nil}
			validations.FeedEndDateValidation(&tc.Severity, feedInfo, tc.Row)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
