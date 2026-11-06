package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestDepartureTimeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stop_times_departure_time_field",
		table: "stop_times",
		field: "departure_time",
		run:   fields.DepartureTimeField,
	})
}
