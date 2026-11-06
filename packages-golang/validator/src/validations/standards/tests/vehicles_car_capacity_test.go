package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestVehiclesCarCapacity(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "vehicles_car_capacity_field",
		table: "vehicles",
		field: "car_capacity",
		run:   standard.CarCapacityField,
	})
}
