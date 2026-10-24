package calendar_dates_standard_test

import (
	"main/types"
	checks "main/validations/calendar_dates/standard/checks"
	testutils "main/validations/calendar_dates/utils"
	"testing"
)

func TestDateValid(t *testing.T) {
	const id = "calendar_dates_date_valid"
	for _, tc := range []struct {
		name    string
		value   any
		missing bool
		count   int
	}{
		{"Valid", "20261019", false, 0}, {"LeapDay", "20240229", false, 0},
		{"NonLeapDay", "20260229", false, 1}, {"InvalidMonth", "20261301", false, 1},
		{"InvalidDay", "20260431", false, 1}, {"Separated", "2026-10-19", false, 1},
		{"Whitespace", " 20261019", false, 1}, {"Short", "2026101", false, 1},
		{"Empty", "", false, 1}, {"Null", nil, false, 1}, {"MissingColumn", nil, true, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			values := map[string]any{}
			if !tc.missing {
				values["date"] = tc.value
			}
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, values, config)
			if err := checks.DateValid(ctx, config.Rule("calendar_dates_date_valid")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "date", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "date", checks.DateValid, map[string]any{"date": "invalid"})
}
