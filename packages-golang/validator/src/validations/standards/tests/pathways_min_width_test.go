package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestPathwaysMinWidth(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "pathways_min_width_field",
		table: "pathways",
		field: "min_width",
		run:   standard.MinWidthField,
	})
}
