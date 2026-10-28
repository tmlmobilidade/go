package shapes_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/shapes/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/shapes/utils"
	"testing"
)

func TestShapeIdField(t *testing.T) { testutils.CheckShapePresence(t, "shape_id", checks.ShapeIdField) }
