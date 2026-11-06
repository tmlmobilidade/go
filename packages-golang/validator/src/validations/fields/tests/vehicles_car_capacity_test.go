package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestCarCapacityField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "vehicles_car_capacity_field",
		table: "vehicles",
		field: "car_capacity",
		run:   fields.CarCapacityField,
	})
}
