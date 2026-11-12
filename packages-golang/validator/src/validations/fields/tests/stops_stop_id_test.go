package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestStopsStopIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_stop_id_field",
		table: "stops",
		field: "stop_id",
		run:   fields.StopsStopIdField,
	})
}
