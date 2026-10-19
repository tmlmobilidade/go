package feed_info_standard_test

import (
	"main/types"
	checks "main/validations/feed_info/standard/checks"
	testutils "main/validations/feed_info/utils"
	"testing"
)

func TestFeedPublisherUrlValid(t *testing.T) {
	const id = "feed_info_feed_publisher_url_valid"
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
			values := map[string]any{"feed_publisher_url": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "feed_publisher_url")
			}
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, values, config)
			if err := checks.FeedPublisherUrlValid(ctx, config); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "feed_publisher_url", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "feed_publisher_url", checks.FeedPublisherUrlValid, map[string]any{"feed_publisher_url": "invalid-url"})
}
