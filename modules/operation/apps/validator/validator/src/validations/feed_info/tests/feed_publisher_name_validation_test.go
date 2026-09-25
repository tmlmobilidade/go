package feed_info

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/feed_info/validations"
	"testing"
)

func TestAllFeedPublisherNameValidationTestCases(t *testing.T) {
	testCases := []struct {
		Name  string
		Value *string
	}{
		{Name: "Optional_Missing", Value: nil},
		{Name: "Optional_Empty", Value: lib.Ptr("")},
		{Name: "Valid_Value", Value: lib.Ptr("Publisher Name")},
	}

	// feed_publisher_name is optional: none of these cases produce messages
	for _, tc := range testCases {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			feedInfo := &types.FeedInfo{FeedPublisherName: tc.Value}
			validations.FeedPublisherNameValidation(nil, feedInfo, 1)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 0, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 0, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
