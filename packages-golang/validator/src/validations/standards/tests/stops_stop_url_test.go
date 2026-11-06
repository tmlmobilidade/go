package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopsStopUrl(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_stop_url_field",
		table: "stops",
		field: "stop_url",
		run:   standard.StopUrlField,
	})
}
