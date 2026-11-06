package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestPathwaysIsBidirectional(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "pathways_is_bidirectional_field",
		table: "pathways",
		field: "is_bidirectional",
		run:   standard.IsBidirectionalField,
	})
}
