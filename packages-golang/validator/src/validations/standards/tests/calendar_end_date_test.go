package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestCalendarEndDate(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "calendar_end_date_field",
		table:         "calendar",
		field:         "end_date",
		run:           standard.EndDateValidation,
		skipForbidden: true,
	})
}
