package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestTotalCapacityField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "vehicles_total_capacity_field",
		table: "vehicles",
		field: "total_capacity",
		run:   fields.TotalCapacityField,
	})
}
