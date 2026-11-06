package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestStopShortNameField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_stop_short_name_field",
		table: "stops",
		field: "stop_short_name",
		run:   fields.StopShortNameField,
	})
}
