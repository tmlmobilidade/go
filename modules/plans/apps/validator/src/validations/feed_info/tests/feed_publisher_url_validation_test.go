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
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			feedInfo := &types.FeedInfo{FeedPublisherUrl: tc.Url}
			validations.FeedPublisherUrlValidation(feedInfo, tc.Row)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
