package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestDateField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:              "calendar_dates_date_field",
		table:           "calendar_dates",
		field:           "date",
		run:             fields.DateField,
		skipForbidden:   true,
		requiredMessage: true,
	})
}
