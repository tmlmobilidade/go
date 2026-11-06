package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestStopUrlField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_stop_url_field",
		table: "stops",
		field: "stop_url",
		run:   fields.StopUrlField,
	})
}
