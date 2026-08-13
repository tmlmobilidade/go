package feed_info

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/feed_info/validations"
	"testing"
)

func TestAllFeedContactEmailValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("feed_contact_email") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}

			var feedInfo *types.FeedInfo
			var feedContactEmail *string
			if tc.Name == "Invalid_Value" {
				feedInfo = &types.FeedInfo{}
			} else if tc.Value != nil {
				// For Valid_Present, use a valid email address instead of generic "valid_value"
				if tc.Name == "Valid_Present" {
					validEmail := test_helpers.GetValidEmails()[0]
					feedContactEmail = &validEmail
				} else {
					feedContactEmail = tc.Value
				}
				feedInfo = &types.FeedInfo{FeedContactEmail: feedContactEmail}
			} else {
				feedInfo = &types.FeedInfo{}
			}

			validations.FeedContactEmailValidation(&severity, feedInfo, tc.Row)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
