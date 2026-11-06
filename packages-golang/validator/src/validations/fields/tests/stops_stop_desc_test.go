package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestStopDescField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_stop_desc_field",
		table: "stops",
		field: "stop_desc",
		run:   fields.StopDescField,
	})
}
