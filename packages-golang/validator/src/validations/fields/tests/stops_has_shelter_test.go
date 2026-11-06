package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestHasShelterField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_has_shelter_field",
		table: "stops",
		field: "has_shelter",
		run:   fields.HasShelterField,
	})
}
