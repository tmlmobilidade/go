package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestIsBidirectionalField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "pathways_is_bidirectional_field",
		table: "pathways",
		field: "is_bidirectional",
		run:   fields.IsBidirectionalField,
	})
}
