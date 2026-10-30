package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestFeedContactUrlValid(t *testing.T) {
	const id = "feed_info_feed_contact_url_valid"
	for _, tc := range []struct {
		name  string
		value any
		count int
	}{{"HTTPS", "https://example.org/feed", 0},
		{"HTTP", "http://example.org", 0},
		{"WhitespaceTrimmed", " https://example.org ", 0},
		{"MissingScheme", "example.org", 1},
		{"WrongScheme", "ftp://example.org", 1},
		{"MissingHost", "https://", 1},
		{"InvalidEscape", "https://example.org/%ZZ", 1},
		{"EmbeddedSpace", "https://example.org/a b", 1},
		{"Empty", "", 1},
		{"Null", nil, 1},
		{"MissingColumn", nil, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			values := map[string]any{"feed_contact_url": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "feed_contact_url")
			}
			config := validationutils.FeedInfoConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.FeedInfoFixture(t, values, config)
			if err := standard.FeedContactUrlValid(ctx, config.Rule("feed_info_feed_contact_url_valid")); err != nil {
				t.Fatal(err)
			}
			validationutils.FeedInfoAssertFindings(t, id, "feed_contact_url", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.FeedInfoCheckInvalid(t, id, "feed_contact_url", standard.FeedContactUrlValid, map[string]any{"feed_contact_url": "invalid-url"})
}
