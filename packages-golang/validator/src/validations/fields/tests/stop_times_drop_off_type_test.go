package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestDropOffTypeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stop_times_drop_off_type_field",
		table: "stop_times",
		field: "drop_off_type",
		run:   fields.DropOffTypeField,
	})
}
