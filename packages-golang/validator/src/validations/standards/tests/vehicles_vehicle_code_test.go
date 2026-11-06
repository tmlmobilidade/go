package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestVehiclesVehicleCode(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "vehicles_vehicle_code_field",
		table: "vehicles",
		field: "vehicle_code",
		run:   standard.VehicleCodeField,
	})
}
