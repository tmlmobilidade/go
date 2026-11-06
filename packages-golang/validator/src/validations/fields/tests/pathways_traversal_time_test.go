package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestTraversalTimeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "pathways_traversal_time_field",
		table: "pathways",
		field: "traversal_time",
		run:   fields.TraversalTimeField,
	})
}
