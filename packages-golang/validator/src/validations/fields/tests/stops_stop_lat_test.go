package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestStopLatField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_stop_lat_field",
		table: "stops",
		field: "stop_lat",
		run:   fields.StopLatField,
	})
}
