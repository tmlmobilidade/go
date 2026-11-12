package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestTripsTripIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "trips_trip_id_field",
		table: "trips",
		field: "trip_id",
		run:   fields.TripsTripIdField,
	})
}
