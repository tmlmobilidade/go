package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopsStopLon(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_stop_lon_field",
		table: "stops",
		field: "stop_lon",
		run:   standard.StopLonField,
	})
}
