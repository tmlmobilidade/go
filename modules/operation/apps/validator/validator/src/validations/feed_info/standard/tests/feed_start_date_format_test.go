package feed_info_standard_test

import (
	"main/types"
	checks "main/validations/feed_info/standard/checks"
	testutils "main/validations/feed_info/utils"
	"testing"
)

func TestFeedStartDateFormat(t *testing.T) {
	const id = "feed_info_feed_start_date_format"
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
			values := map[string]any{"feed_start_date": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "feed_start_date")
			}
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, values, config)
			if err := checks.FeedStartDateFormat(ctx, config); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "feed_start_date_format", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "feed_start_date_format", checks.FeedStartDateFormat, map[string]any{"feed_start_date": "20260230"})
}
