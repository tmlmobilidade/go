package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestCalendarDateValid(t *testing.T) {
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
			config := validationutils.CalendarConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.CalendarFixture(t, map[string]any{"start_date": tc.start, "end_date": tc.end}, config)
			if err := standard.CalendarDateValid(ctx, config.Rule("calendar_start_end_dates_valid")); err != nil {
				t.Fatal(err)
			}
			validationutils.CalendarAssertFindings(t, id, "dates", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.CheckDateSeverities(t, id, standard.CalendarDateValid, map[string]any{"start_date": "20261231", "end_date": "20260101"})
}
