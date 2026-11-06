package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestVehicleTypeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "vehicles_vehicle_type_field",
		table: "vehicles",
		field: "vehicle_type",
		run:   fields.VehicleTypeField,
	})
}
