package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopsStopId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_stop_id_field",
		table: "stops",
		field: "stop_id",
		run:   standard.StopsStopIdField,
	})
}
