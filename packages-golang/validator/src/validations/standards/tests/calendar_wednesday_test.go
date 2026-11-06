package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestCalendarWednesday(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "calendar_wednesday_field",
		table:         "calendar",
		field:         "wednesday",
		run:           standard.WednesdayValidation,
		skipForbidden: true,
	})
}
