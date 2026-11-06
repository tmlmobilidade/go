package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestWednesdayValidation(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "calendar_wednesday_field",
		table:         "calendar",
		field:         "wednesday",
		run:           fields.WednesdayValidation,
		skipForbidden: true,
	})
}
