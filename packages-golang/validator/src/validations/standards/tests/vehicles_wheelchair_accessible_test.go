package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestVehiclesWheelchairAccessible(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "vehicles_wheelchair_accessible_field",
		table: "vehicles",
		field: "wheelchair_accessible",
		run:   standard.VehiclesWheelchairAccessibleField,
	})
}
