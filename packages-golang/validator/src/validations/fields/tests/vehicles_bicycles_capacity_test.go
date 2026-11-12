package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestBicyclesCapacityField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "vehicles_bicycles_capacity_field",
		table: "vehicles",
		field: "bicycles_capacity",
		run:   fields.BicyclesCapacityField,
	})
}
