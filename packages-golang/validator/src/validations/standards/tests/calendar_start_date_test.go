package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestCalendarStartDate(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "calendar_start_date_field",
		table:         "calendar",
		field:         "start_date",
		run:           standard.StartDateValidation,
		skipForbidden: true,
	})
}
