package calendar_standard_test

import (
	"main/types"
	checks "main/validations/calendar/standard/checks"
	testutils "main/validations/calendar/utils"
	"testing"
)

func TestDateValid(t *testing.T) {
	const id = "calendar_start_end_dates_valid"
	for _, tc := range []struct {
		name, start, end string
		count            int
	}{
		{"Increasing", "20260101", "20261231", 0},
		{"AcrossYear", "20261231", "20270101", 0},
		{"Reversed", "20261231", "20260101", 1},
		// The current rule explicitly requires start_date < end_date.
		{"EqualDates", "20260101", "20260101", 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"start_date": tc.start, "end_date": tc.end}, config)
			if err := checks.DateValid(ctx, config.Rule("calendar_start_end_dates_valid")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "dates", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckDateSeverities(t, id, checks.DateValid, map[string]any{"start_date": "20261231", "end_date": "20260101"})
}
