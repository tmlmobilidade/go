package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestHasStopSignField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_has_stop_sign_field",
		table: "stops",
		field: "has_stop_sign",
		run:   fields.HasStopSignField,
	})
}
