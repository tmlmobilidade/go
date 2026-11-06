package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestShapePtSequenceField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "shapes_shape_pt_sequence_field",
		table: "shapes",
		field: "shape_pt_sequence",
		run:   fields.ShapePtSequenceField,
	})
}
