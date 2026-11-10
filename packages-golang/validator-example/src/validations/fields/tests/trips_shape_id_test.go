package fields_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/utils/validations"
	fields "github.com/tmlmobilidade/go/packages-golang/validator-example/src/validations/fields/checks"
	"testing"
)

func TestTripsShapeIdField(t *testing.T) {
	testutil.Presence(t, "shape_id", "trips_shape_id_field", fields.TripsShapeIdField)
}
