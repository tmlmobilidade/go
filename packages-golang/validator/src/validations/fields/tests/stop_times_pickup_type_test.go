package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestPickupTypeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stop_times_pickup_type_field",
		table: "stop_times",
		field: "pickup_type",
		run:   fields.PickupTypeField,
	})
}
