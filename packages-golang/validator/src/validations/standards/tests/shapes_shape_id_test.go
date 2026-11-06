package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestShapesShapeId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "shapes_shape_id_field",
		table: "shapes",
		field: "shape_id",
		run:   standard.ShapesShapeIdField,
	})
}
