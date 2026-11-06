package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestVehiclesPropulsion(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "vehicles_propulsion_field",
		table: "vehicles",
		field: "propulsion",
		run:   standard.PropulsionField,
	})
}
