package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestStopCodeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_stop_code_field",
		table: "stops",
		field: "stop_code",
		run:   fields.StopCodeField,
	})
}
