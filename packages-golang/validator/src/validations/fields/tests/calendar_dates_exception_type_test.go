package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestExceptionTypeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:              "calendar_dates_exception_type_field",
		table:           "calendar_dates",
		field:           "exception_type",
		run:             fields.ExceptionTypeField,
		skipForbidden:   true,
		requiredMessage: true,
	})
}
