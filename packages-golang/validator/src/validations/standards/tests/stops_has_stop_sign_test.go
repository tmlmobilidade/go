package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopsHasStopSign(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_has_stop_sign_field",
		table: "stops",
		field: "has_stop_sign",
		run:   standard.HasStopSignField,
	})
}
