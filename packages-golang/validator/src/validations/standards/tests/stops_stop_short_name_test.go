package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopsStopShortName(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_stop_short_name_field",
		table: "stops",
		field: "stop_short_name",
		run:   standard.StopShortNameField,
	})
}
