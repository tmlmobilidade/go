package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestStopHeadsignField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stop_times_stop_headsign_field",
		table: "stop_times",
		field: "stop_headsign",
		run:   fields.StopHeadsignField,
	})
}
