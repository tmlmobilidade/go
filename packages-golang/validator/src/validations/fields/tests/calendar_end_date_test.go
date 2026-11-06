package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestEndDateValidation(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "calendar_end_date_field",
		table:         "calendar",
		field:         "end_date",
		run:           fields.EndDateValidation,
		skipForbidden: true,
	})
}
