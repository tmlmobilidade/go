package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestStartDateValidation(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "calendar_start_date_field",
		table:         "calendar",
		field:         "start_date",
		run:           fields.StartDateValidation,
		skipForbidden: true,
	})
}
