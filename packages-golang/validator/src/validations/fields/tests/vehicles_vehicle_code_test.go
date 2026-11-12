package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestVehicleCodeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "vehicles_vehicle_code_field",
		table: "vehicles",
		field: "vehicle_code",
		run:   fields.VehicleCodeField,
	})
}
