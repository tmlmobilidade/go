package feed_info

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/feed_info/validations"
	"testing"
)

func TestAllFeedLangValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetValidLanguageCodes()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("feed_lang") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		var severity types.Severity
		if tc.ExpectedWarnings > 0 {
			severity = types.SEVERITY_WARNING
		} else {
			severity = types.SEVERITY_ERROR
		}
		
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var feedLang *string
			if tc.Name == "Invalid_Value" {
				feedLang = lib.Ptr("notalang")
			} else if tc.Value != nil {
				feedLang = lib.Ptr(validOptions[0])
			} else {
				feedLang = nil
			}
			validations.FeedLangValidation(&types.FeedInfo{FeedLang: feedLang}, tc.Row, &types.FeedInfoRules{FeedLang: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
