package shapes_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/shapes/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/shapes/utils"
	"testing"
)

func TestShapeDistTraveledField(t *testing.T) {
	testutils.CheckShapePresence(t, "shape_dist_traveled", checks.ShapeDistTraveledField)
}
