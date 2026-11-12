package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestShelterCodeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_shelter_code_field",
		table: "stops",
		field: "shelter_code",
		run:   fields.ShelterCodeField,
	})
}
