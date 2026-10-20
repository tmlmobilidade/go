package shapes_standard_test

import (
	checks "main/validations/shapes/standard/checks"
	testutils "main/validations/shapes/utils"
	"testing"
)

func TestShapePtLonValid(t *testing.T) {
	testutils.CheckShapeValues(t, "shapes_shape_pt_lon_valid", "shape_pt_lon", checks.ShapePtLonValid, []string{"-180", "180", "0", "-9.14"}, []string{"", "bad", "-180.01", "180.01", "NaN", "+Inf", "-Inf"})
}
