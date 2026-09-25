package feed_info

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/feed_info/validations"
	"testing"
)

func TestAllFeedPublisherUrlValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericUrlTestCases("feed_publisher_url") {
		expectedErrors := tc.ExpectedErrors
		// feed_publisher_url is optional: missing is not an error
		if tc.Name == "Required_Missing" {
			expectedErrors = 0
		}

		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}
			
			feedInfo := &types.FeedInfo{FeedPublisherUrl: tc.Url}
			validations.FeedPublisherUrlValidation(&severity, feedInfo, tc.Row)
			test_helpers.AssertMessageCount(t, services.AppMessageService, expectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
