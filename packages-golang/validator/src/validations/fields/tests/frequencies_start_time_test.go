package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestStartTimeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "frequencies_start_time_field",
		table: "frequencies",
		field: "start_time",
		run:   fields.StartTimeField,
	})
}
