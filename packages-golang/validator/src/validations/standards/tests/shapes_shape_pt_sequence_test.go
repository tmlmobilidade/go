package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestShapesShapePtSequence(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "shapes_shape_pt_sequence_field",
		table: "shapes",
		field: "shape_pt_sequence",
		run:   standard.ShapePtSequenceField,
	})
}
