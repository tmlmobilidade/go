package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestTripHeadsignField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "trips_trip_headsign_field",
		table: "trips",
		field: "trip_headsign",
		run:   fields.TripHeadsignField,
	})
}
