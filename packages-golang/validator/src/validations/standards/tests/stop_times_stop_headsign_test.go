package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopTimesStopHeadsign(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stop_times_stop_headsign_field",
		table: "stop_times",
		field: "stop_headsign",
		run:   standard.StopHeadsignField,
	})
}
