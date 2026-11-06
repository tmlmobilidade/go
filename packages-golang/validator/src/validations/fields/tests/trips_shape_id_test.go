package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestTripsShapeIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "trips_shape_id_field",
		table: "trips",
		field: "shape_id",
		run:   fields.TripsShapeIdField,
	})
}
