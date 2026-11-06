package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopsStopDesc(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_stop_desc_field",
		table: "stops",
		field: "stop_desc",
		run:   standard.StopDescField,
	})
}
