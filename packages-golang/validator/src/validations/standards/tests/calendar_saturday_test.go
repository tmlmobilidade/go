package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestCalendarSaturday(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "calendar_saturday_field",
		table:         "calendar",
		field:         "saturday",
		run:           standard.SaturdayValidation,
		skipForbidden: true,
	})
}
