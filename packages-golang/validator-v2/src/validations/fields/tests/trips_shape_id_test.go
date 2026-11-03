package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/utils"
	"testing"
)

func TestTripsShapeIdField(t *testing.T) {
	testutil.Presence(t, "shape_id", "trips_shape_id_field", fields.TripsShapeIdField)
}
