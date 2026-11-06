package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopTimesTripId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stop_times_trip_id_field",
		table: "stop_times",
		field: "trip_id",
		run:   standard.StopTimesTripIdField,
	})
}
