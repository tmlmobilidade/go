package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestTripsShapeId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "trips_shape_id_field",
		table: "trips",
		field: "shape_id",
		run:   standard.TripsShapeIdField,
	})
}
