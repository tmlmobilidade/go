package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestTuesdayValidation(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "calendar_tuesday_field",
		table:         "calendar",
		field:         "tuesday",
		run:           fields.TuesdayValidation,
		skipForbidden: true,
	})
}
