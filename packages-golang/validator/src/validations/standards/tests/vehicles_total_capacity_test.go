package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestVehiclesTotalCapacity(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "vehicles_total_capacity_field",
		table: "vehicles",
		field: "total_capacity",
		run:   standard.TotalCapacityField,
	})
}
