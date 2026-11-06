package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopsStopTimezone(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_stop_timezone_field",
		table: "stops",
		field: "stop_timezone",
		run:   standard.StopTimezoneField,
	})
}
