package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestPatternIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "trips_pattern_id_field",
		table: "trips",
		field: "pattern_id",
		run:   fields.PatternIdField,
	})
}
