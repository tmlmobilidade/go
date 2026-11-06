package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopsStopLat(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_stop_lat_field",
		table: "stops",
		field: "stop_lat",
		run:   standard.StopLatField,
	})
}
