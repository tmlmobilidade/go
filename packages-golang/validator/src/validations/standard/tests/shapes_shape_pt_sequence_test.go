package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestShapePtSequence(t *testing.T) {
	validationutils.CheckShapeValues(t, "shapes_shape_pt_sequence_non_negative", "shape_pt_sequence", standard.ShapePtSequence, []string{"0", "1", "100"}, []string{"", "bad", "-1", "1.5", "1e3", "999999999999999999999999"})
}
