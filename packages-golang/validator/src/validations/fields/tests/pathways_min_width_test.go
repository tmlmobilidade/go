package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestMinWidthField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "pathways_min_width_field",
		table: "pathways",
		field: "min_width",
		run:   fields.MinWidthField,
	})
}
