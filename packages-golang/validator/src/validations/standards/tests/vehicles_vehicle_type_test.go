package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestVehiclesVehicleType(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "vehicles_vehicle_type_field",
		table: "vehicles",
		field: "vehicle_type",
		run:   standard.VehicleTypeField,
	})
}
