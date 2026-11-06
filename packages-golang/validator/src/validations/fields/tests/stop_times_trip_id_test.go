package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestStopTimesTripIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stop_times_trip_id_field",
		table: "stop_times",
		field: "trip_id",
		run:   fields.StopTimesTripIdField,
	})
}
