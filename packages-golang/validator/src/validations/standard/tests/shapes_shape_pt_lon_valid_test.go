package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestShapePtLonValid(t *testing.T) {
	validationutils.CheckShapeValues(t, "shapes_shape_pt_lon_valid", "shape_pt_lon", standard.ShapePtLonValid, []string{"-180", "180", "0", "-9.14"}, []string{"", "bad", "-180.01", "180.01", "NaN", "+Inf", "-Inf"})
}
