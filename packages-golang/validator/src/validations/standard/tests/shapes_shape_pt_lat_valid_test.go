package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestShapePtLatValid(t *testing.T) {
	validationutils.CheckShapeValues(t, "shapes_shape_pt_lat_valid", "shape_pt_lat", standard.ShapePtLatValid, []string{"-90", "90", "0", "38.72"}, []string{"", "bad", "-90.01", "90.01", "NaN", "+Inf", "-Inf"})
}
