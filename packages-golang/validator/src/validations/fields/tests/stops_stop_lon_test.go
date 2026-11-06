package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestStopLonField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_stop_lon_field",
		table: "stops",
		field: "stop_lon",
		run:   fields.StopLonField,
	})
}
