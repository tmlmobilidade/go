package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopsStopCode(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_stop_code_field",
		table: "stops",
		field: "stop_code",
		run:   standard.StopCodeField,
	})
}
