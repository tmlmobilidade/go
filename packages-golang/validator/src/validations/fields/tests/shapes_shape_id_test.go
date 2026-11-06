package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestShapesShapeIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "shapes_shape_id_field",
		table: "shapes",
		field: "shape_id",
		run:   fields.ShapesShapeIdField,
	})
}
