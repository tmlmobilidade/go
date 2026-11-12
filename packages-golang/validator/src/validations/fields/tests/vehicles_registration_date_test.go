package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestRegistrationDateField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "vehicles_registration_date_field",
		table: "vehicles",
		field: "registration_date",
		run:   fields.RegistrationDateField,
	})
}
