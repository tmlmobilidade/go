package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestFeedLangValid(t *testing.T) {
	const id = "feed_info_feed_lang_valid"
	for _, tc := range []struct {
		name  string
		value any
		count int
	}{{"Portuguese", "pt", 0},
		{"English", "en", 0},
		{"Uppercase", "PT", 0},
		{"Unknown", "zz", 1},
		{"RegionalTag", "pt-PT", 1},
		{"Whitespace", " pt ", 1},
		{"Empty", "", 1},
		{"Null", nil, 1},
		{"MissingColumn", nil, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			values := map[string]any{"feed_lang": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "feed_lang")
			}
			config := validationutils.FeedInfoConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.FeedInfoFixture(t, values, config)
			if err := standard.FeedLangValid(ctx, config.Rule("feed_info_feed_lang_valid")); err != nil {
				t.Fatal(err)
			}
			validationutils.FeedInfoAssertFindings(t, id, "feed_lang", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.FeedInfoCheckInvalid(t, id, "feed_lang", standard.FeedLangValid, map[string]any{"feed_lang": "zz"})
}
