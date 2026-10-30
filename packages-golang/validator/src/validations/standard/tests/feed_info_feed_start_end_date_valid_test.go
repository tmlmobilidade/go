package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
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
			config := validationutils.FeedInfoConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.FeedInfoFixture(t, tc.values, config)
			if err := standard.FeedStartEndDateValid(ctx, config.Rule("feed_info_start_end_dates_valid")); err != nil {
				t.Fatal(err)
			}
			validationutils.FeedInfoAssertFindings(t, id, "dates", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.FeedInfoCheckInvalid(t, id, "dates", standard.FeedStartEndDateValid, map[string]any{"feed_start_date": "20261231", "feed_end_date": "20260101"})
}
