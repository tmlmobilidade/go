package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestCalendarFriday(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "calendar_friday_field",
		table:         "calendar",
		field:         "friday",
		run:           standard.FridayValidation,
		skipForbidden: true,
	})
}
