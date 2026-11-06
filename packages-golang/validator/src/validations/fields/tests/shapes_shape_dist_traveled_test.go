package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestShapesShapeDistTraveledField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "shapes_shape_dist_traveled_field",
		table: "shapes",
		field: "shape_dist_traveled",
		run:   fields.ShapesShapeDistTraveledField,
	})
}
