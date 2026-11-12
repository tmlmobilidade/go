package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestMondayValidation(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "calendar_monday_field",
		table:         "calendar",
		field:         "monday",
		run:           fields.MondayValidation,
		skipForbidden: true,
	})
}
