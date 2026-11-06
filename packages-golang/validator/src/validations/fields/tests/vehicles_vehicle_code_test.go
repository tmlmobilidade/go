package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestVehicleCodeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "vehicles_vehicle_code_field",
		table: "vehicles",
		field: "vehicle_code",
		run:   fields.VehicleCodeField,
	})
}
