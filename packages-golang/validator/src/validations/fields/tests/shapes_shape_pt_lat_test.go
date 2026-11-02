package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestShapePtLatField(t *testing.T) {
	validationutils.CheckShapePresence(t, "shape_pt_lat", fields.ShapePtLatField)
}
