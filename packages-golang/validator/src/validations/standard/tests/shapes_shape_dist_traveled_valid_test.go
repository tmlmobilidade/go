package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestShapesShapeDistTraveledValid(t *testing.T) {
	validationutils.CheckShapeValues(t, "shapes_shape_dist_traveled_valid", "shape_dist_traveled", standard.ShapesShapeDistTraveledValid, []string{"0", "0.001", "1000"}, []string{"", "bad", "-1", "NaN", "+Inf", "-Inf"})
}
