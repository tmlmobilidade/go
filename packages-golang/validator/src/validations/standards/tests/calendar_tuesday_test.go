package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestCalendarTuesday(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "calendar_tuesday_field",
		table:         "calendar",
		field:         "tuesday",
		run:           standard.TuesdayValidation,
		skipForbidden: true,
	})
}
