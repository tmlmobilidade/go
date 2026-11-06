package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestVehiclesBicyclesCapacity(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "vehicles_bicycles_capacity_field",
		table: "vehicles",
		field: "bicycles_capacity",
		run:   standard.BicyclesCapacityField,
	})
}
