package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestCalendarDatesDateValid(t *testing.T) {
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
			config := validationutils.CalendarDatesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.CalendarDatesFixture(t, values, config)
			if err := standard.CalendarDatesDateValid(ctx, config.Rule("calendar_dates_date_valid")); err != nil {
				t.Fatal(err)
			}
			validationutils.CalendarDatesAssertFindings(t, id, "date", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.CalendarDatesCheckInvalid(t, id, "date", standard.CalendarDatesDateValid, map[string]any{"date": "invalid"})
}
