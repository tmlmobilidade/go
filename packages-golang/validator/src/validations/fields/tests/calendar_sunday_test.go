package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestSundayValidation(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "calendar_sunday_field",
		table:         "calendar",
		field:         "sunday",
		run:           fields.SundayValidation,
		skipForbidden: true,
	})
}
