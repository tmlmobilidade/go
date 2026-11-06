package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestVehiclesEmission(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "vehicles_emission_field",
		table: "vehicles",
		field: "emission",
		run:   standard.EmissionField,
	})
}
