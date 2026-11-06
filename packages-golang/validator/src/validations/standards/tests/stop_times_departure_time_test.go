package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopTimesDepartureTime(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stop_times_departure_time_field",
		table: "stop_times",
		field: "departure_time",
		run:   standard.DepartureTimeField,
	})
}
