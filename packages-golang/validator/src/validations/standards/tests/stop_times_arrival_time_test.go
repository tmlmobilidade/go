package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopTimesArrivalTime(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stop_times_arrival_time_field",
		table: "stop_times",
		field: "arrival_time",
		run:   standard.ArrivalTimeField,
	})
}
