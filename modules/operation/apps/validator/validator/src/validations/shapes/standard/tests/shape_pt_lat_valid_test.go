package shapes_standard_test

import (
	checks "main/validations/shapes/standard/checks"
	testutils "main/validations/shapes/utils"
	"testing"
)

func TestShapePtLatValid(t *testing.T) {
	testutils.CheckShapeValues(t, "shapes_shape_pt_lat_valid", "shape_pt_lat", checks.ShapePtLatValid, []string{"-90", "90", "0", "38.72"}, []string{"", "bad", "-90.01", "90.01", "NaN", "+Inf", "-Inf"})
}
