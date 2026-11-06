package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestStopTimesStopIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stop_times_stop_id_field",
		table: "stop_times",
		field: "stop_id",
		run:   fields.StopTimesStopIdField,
	})
}
