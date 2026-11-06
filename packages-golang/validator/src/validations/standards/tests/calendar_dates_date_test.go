package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestCalendarDatesDate(t *testing.T) {
	checkPresence(t, standardCheck{
		id:              "calendar_dates_date_field",
		table:           "calendar_dates",
		field:           "date",
		run:             standard.DateField,
		skipForbidden:   true,
		requiredMessage: true,
	})
}
