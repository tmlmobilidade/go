package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestVehicleIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "vehicles_vehicle_id_field",
		table: "vehicles",
		field: "vehicle_id",
		run:   fields.VehicleIdField,
	})
}
