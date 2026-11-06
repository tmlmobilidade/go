package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopTimesStopId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stop_times_stop_id_field",
		table: "stop_times",
		field: "stop_id",
		run:   standard.StopTimesStopIdField,
	})
}
