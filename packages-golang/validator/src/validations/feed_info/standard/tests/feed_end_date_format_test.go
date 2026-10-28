package feed_info_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/feed_info/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/feed_info/utils"
	"main/types"
	"testing"
)

func TestFeedEndDateFormat(t *testing.T) {
	const id = "feed_info_feed_end_date_format"
	for _, tc := range []struct {
		name  string
		value any
		count int
	}{{"Valid", "20260101", 0},
		{"LeapDay", "20240229", 0},
		{"NonLeapDay", "20250229", 1},
		{"InvalidDay", "20260431", 1},
		{"InvalidMonth", "20261301", 1},
		{"Separated", "2026-01-01", 1},
		{"Short", "2026011", 1},
		{"Whitespace", " 20260101", 1},
		{"Text", "abcdefgh", 1},
		{"Empty", "", 1},
		{"Null", nil, 1},
		{"MissingColumn", nil, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			values := map[string]any{"feed_end_date": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "feed_end_date")
			}
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, values, config)
			if err := checks.FeedEndDateFormat(ctx, config.Rule("feed_info_feed_end_date_format")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "feed_end_date_format", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "feed_end_date_format", checks.FeedEndDateFormat, map[string]any{"feed_end_date": "20260230"})
}
