package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestCalendarDatesExceptionType(t *testing.T) {
	checkPresence(t, standardCheck{
		id:              "calendar_dates_exception_type_field",
		table:           "calendar_dates",
		field:           "exception_type",
		run:             standard.ExceptionTypeField,
		skipForbidden:   true,
		requiredMessage: true,
	})
}
