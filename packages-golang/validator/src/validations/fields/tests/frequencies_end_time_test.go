package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestEndTimeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "frequencies_end_time_field",
		table: "frequencies",
		field: "end_time",
		run:   fields.EndTimeField,
	})
}
