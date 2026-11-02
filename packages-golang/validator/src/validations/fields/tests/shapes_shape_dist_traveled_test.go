package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestShapesShapeDistTraveledField(t *testing.T) {
	validationutils.CheckShapePresence(t, "shape_dist_traveled", fields.ShapesShapeDistTraveledField)
}
