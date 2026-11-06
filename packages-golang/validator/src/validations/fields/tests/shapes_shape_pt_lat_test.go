package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestShapePtLatField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "shapes_shape_pt_lat_field",
		table: "shapes",
		field: "shape_pt_lat",
		run:   fields.ShapePtLatField,
	})
}
