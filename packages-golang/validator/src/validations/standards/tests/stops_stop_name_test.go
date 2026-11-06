package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopsStopName(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_stop_name_field",
		table: "stops",
		field: "stop_name",
		run:   standard.StopNameField,
	})
}
