package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestShapePtLonField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "shapes_shape_pt_lon_field",
		table: "shapes",
		field: "shape_pt_lon",
		run:   fields.ShapePtLonField,
	})
}
