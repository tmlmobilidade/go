package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestDateValidFormat(t *testing.T) {
	const id = "calendar_start_end_dates_valid_format"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{
		{"Valid", map[string]any{"start_date": "20260101", "end_date": "20261231"}, 0},
		{"LeapDay", map[string]any{"start_date": "20240229", "end_date": "20240301"}, 0},
		{"InvalidStart", map[string]any{"start_date": "20260229", "end_date": "20261231"}, 1},
		{"InvalidEnd", map[string]any{"start_date": "20260101", "end_date": "20261301"}, 1},
		{"BothInvalid", map[string]any{"start_date": "2026-01-01", "end_date": "2026-12-31"}, 2},
		{"Whitespace", map[string]any{"start_date": " 20260101", "end_date": "20261231"}, 1},
		{"MissingStart", map[string]any{"end_date": "20261231"}, 1},
		{"MissingEnd", map[string]any{"start_date": "20260101"}, 1},
		{"EmptyAndNull", map[string]any{"start_date": "", "end_date": nil}, 2},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := validationutils.CalendarConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.CalendarFixture(t, tc.values, config)
			if err := standard.DateValidFormat(ctx, config.Rule("calendar_start_end_dates_valid_format")); err != nil {
				t.Fatal(err)
			}
			validationutils.CalendarAssertFindings(t, id, "dates", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.CheckDateSeverities(t, id, standard.DateValidFormat, map[string]any{"start_date": "invalid", "end_date": "20261231"})
}
