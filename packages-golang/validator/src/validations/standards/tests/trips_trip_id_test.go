package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestTripsTripId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "trips_trip_id_field",
		table: "trips",
		field: "trip_id",
		run:   standard.TripsTripIdField,
	})
}
