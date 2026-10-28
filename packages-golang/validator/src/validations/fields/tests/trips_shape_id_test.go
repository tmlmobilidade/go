package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestTripsShapeIdField(t *testing.T) {
	validationutils.TripsCheckPresence(t, "shape_id", fields.TripsShapeIdField)
}
