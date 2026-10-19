package feed_info_standard_test

import (
	"main/types"
	checks "main/validations/feed_info/standard/checks"
	testutils "main/validations/feed_info/utils"
	"testing"
)

func TestFeedStartEndDateValid(t *testing.T) {
	const id = "feed_info_start_end_dates_valid"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{
		{"Ordered", map[string]any{"feed_start_date": "20260101", "feed_end_date": "20261231"}, 0},
		{"AcrossYears", map[string]any{"feed_start_date": "20261231", "feed_end_date": "20270101"}, 0},
		{"Equal", map[string]any{"feed_start_date": "20260101", "feed_end_date": "20260101"}, 1},
		{"Reversed", map[string]any{"feed_start_date": "20261231", "feed_end_date": "20260101"}, 1},
		{"Empty", map[string]any{"feed_start_date": "", "feed_end_date": ""}, 1},
		{"Null", map[string]any{"feed_start_date": nil, "feed_end_date": nil}, 1},
		{"MissingColumns", map[string]any{}, 1},
		// This check compares raw values; format and presence have separate checks.
		{"MissingStart", map[string]any{"feed_end_date": "20261231"}, 0},
		{"MissingEnd", map[string]any{"feed_start_date": "20260101"}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)
			if err := checks.FeedStartEndDateValid(ctx, config); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "dates", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "dates", checks.FeedStartEndDateValid, map[string]any{"feed_start_date": "20261231", "feed_end_date": "20260101"})
}
