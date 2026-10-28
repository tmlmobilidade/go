package shapes_standard_test

import (
	checks "main/validations/shapes/standard/checks"
	testutils "main/validations/shapes/utils"
	"testing"
)

func TestShapeDistTraveledValid(t *testing.T) {
	testutils.CheckShapeValues(t, "shapes_shape_dist_traveled_valid", "shape_dist_traveled", checks.ShapeDistTraveledValid, []string{"0", "0.001", "1000"}, []string{"", "bad", "-1", "NaN", "+Inf", "-Inf"})
}
