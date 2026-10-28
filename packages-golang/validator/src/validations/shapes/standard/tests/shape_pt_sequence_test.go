package shapes_standard_test

import (
	checks "main/validations/shapes/standard/checks"
	testutils "main/validations/shapes/utils"
	"testing"
)

func TestShapePtSequence(t *testing.T) {
	testutils.CheckShapeValues(t, "shapes_shape_pt_sequence_non_negative", "shape_pt_sequence", checks.ShapePtSequence, []string{"0", "1", "100"}, []string{"", "bad", "-1", "1.5", "1e3", "999999999999999999999999"})
}
