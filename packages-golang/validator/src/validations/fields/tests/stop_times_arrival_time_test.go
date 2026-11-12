package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestArrivalTimeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stop_times_arrival_time_field",
		table: "stop_times",
		field: "arrival_time",
		run:   fields.ArrivalTimeField,
	})
}
