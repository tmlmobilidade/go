package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopTimesPickupType(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stop_times_pickup_type_field",
		table: "stop_times",
		field: "pickup_type",
		run:   standard.PickupTypeField,
	})
}
