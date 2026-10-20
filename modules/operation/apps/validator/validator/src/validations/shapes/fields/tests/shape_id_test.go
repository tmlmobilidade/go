package shapes_fields_test

import (
	checks "main/validations/shapes/fields/checks"
	testutils "main/validations/shapes/utils"
	"testing"
)

func TestShapeIdField(t *testing.T) { testutils.CheckShapePresence(t, "shape_id", checks.ShapeIdField) }
