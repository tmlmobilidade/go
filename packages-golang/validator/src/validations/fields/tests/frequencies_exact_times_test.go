package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestExactTimesField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "frequencies_exact_times_field",
		table: "frequencies",
		field: "exact_times",
		run:   fields.ExactTimesField,
	})
}
