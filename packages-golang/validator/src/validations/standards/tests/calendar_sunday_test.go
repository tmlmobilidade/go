package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestCalendarSunday(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "calendar_sunday_field",
		table:         "calendar",
		field:         "sunday",
		run:           standard.SundayValidation,
		skipForbidden: true,
	})
}
