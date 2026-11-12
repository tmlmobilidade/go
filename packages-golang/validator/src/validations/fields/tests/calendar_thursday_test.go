package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestThursdayValidation(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "calendar_thursday_field",
		table:         "calendar",
		field:         "thursday",
		run:           fields.ThursdayValidation,
		skipForbidden: true,
	})
}
