package shapes_fields_test

import (
	checks "main/validations/shapes/fields/checks"
	testutils "main/validations/shapes/utils"
	"testing"
)

func TestShapePtSequenceField(t *testing.T) {
	testutils.CheckShapePresence(t, "shape_pt_sequence", checks.ShapePtSequenceField)
}
