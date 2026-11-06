package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestEmissionField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "vehicles_emission_field",
		table: "vehicles",
		field: "emission",
		run:   fields.EmissionField,
	})
}
