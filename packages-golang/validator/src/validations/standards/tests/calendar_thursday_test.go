package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestCalendarThursday(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "calendar_thursday_field",
		table:         "calendar",
		field:         "thursday",
		run:           standard.ThursdayValidation,
		skipForbidden: true,
	})
}
