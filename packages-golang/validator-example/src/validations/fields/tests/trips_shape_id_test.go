package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator-example/src/validations/fields/checks"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/validations/utils"
	"testing"
)

func TestTripsShapeIdField(t *testing.T) {
	testutil.Presence(t, "shape_id", "trips_shape_id_field", fields.TripsShapeIdField)
}
