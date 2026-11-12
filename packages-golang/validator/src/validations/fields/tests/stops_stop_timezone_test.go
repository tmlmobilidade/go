package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestStopTimezoneField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_stop_timezone_field",
		table: "stops",
		field: "stop_timezone",
		run:   fields.StopTimezoneField,
	})
}
