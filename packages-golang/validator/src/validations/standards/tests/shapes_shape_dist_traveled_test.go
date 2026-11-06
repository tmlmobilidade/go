package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestShapesShapeDistTraveled(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "shapes_shape_dist_traveled_field",
		table: "shapes",
		field: "shape_dist_traveled",
		run:   standard.ShapesShapeDistTraveledField,
	})
}
