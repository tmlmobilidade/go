package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestExceptionTypeValid(t *testing.T) {
	const id = "calendar_dates_exception_type_valid"
	for _, tc := range []struct {
		name    string
		value   any
		missing bool
		count   int
	}{
		{"Added", "1", false, 0}, {"Removed", "2", false, 0},
		{"Zero", "0", false, 1}, {"Three", "3", false, 1}, {"Negative", "-1", false, 1},
		{"Decimal", "1.0", false, 1}, {"Text", "added", false, 1}, {"Whitespace", " 1", false, 1},
		{"Empty", "", false, 1}, {"Null", nil, false, 1}, {"MissingColumn", nil, true, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			values := map[string]any{}
			if !tc.missing {
				values["exception_type"] = tc.value
			}
			config := validationutils.CalendarDatesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.CalendarDatesFixture(t, values, config)
			if err := standard.ExceptionTypeValid(ctx, config.Rule("calendar_dates_exception_type_valid")); err != nil {
				t.Fatal(err)
			}
			validationutils.CalendarDatesAssertFindings(t, id, "exception_type", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.CalendarDatesCheckInvalid(t, id, "exception_type", standard.ExceptionTypeValid, map[string]any{"exception_type": "3"})
}
