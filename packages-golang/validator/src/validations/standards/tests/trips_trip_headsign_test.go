package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestTripsTripHeadsign(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "trips_trip_headsign_field",
		table: "trips",
		field: "trip_headsign",
		run:   standard.TripHeadsignField,
	})
}
