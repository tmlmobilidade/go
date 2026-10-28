package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestShapesShapeIdField(t *testing.T) {
	validationutils.CheckShapePresence(t, "shape_id", fields.ShapesShapeIdField)
}
