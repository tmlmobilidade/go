package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestTimepointField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stop_times_timepoint_field",
		table: "stop_times",
		field: "timepoint",
		run:   fields.TimepointField,
	})
}
