package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestVehiclesRegistrationDate(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "vehicles_registration_date_field",
		table: "vehicles",
		field: "registration_date",
		run:   standard.RegistrationDateField,
	})
}
