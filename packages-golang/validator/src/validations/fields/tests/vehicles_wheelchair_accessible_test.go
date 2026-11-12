package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestVehiclesWheelchairAccessibleField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "vehicles_wheelchair_accessible_field",
		table: "vehicles",
		field: "wheelchair_accessible",
		run:   fields.VehiclesWheelchairAccessibleField,
	})
}
