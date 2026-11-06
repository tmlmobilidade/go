package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestPathwaysTraversalTime(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "pathways_traversal_time_field",
		table: "pathways",
		field: "traversal_time",
		run:   standard.TraversalTimeField,
	})
}
