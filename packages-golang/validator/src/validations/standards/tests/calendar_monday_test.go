package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestCalendarMonday(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "calendar_monday_field",
		table:         "calendar",
		field:         "monday",
		run:           standard.MondayValidation,
		skipForbidden: true,
	})
}
