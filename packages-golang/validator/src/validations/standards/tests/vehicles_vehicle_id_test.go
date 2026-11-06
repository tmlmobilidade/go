package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestVehiclesVehicleId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "vehicles_vehicle_id_field",
		table: "vehicles",
		field: "vehicle_id",
		run:   standard.VehicleIdField,
	})
}
