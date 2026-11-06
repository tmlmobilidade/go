package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestTripsTripShortName(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "trips_trip_short_name_field",
		table: "trips",
		field: "trip_short_name",
		run:   standard.TripShortNameField,
	})
}
