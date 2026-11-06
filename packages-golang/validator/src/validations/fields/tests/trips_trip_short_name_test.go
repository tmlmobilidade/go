package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestTripShortNameField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "trips_trip_short_name_field",
		table: "trips",
		field: "trip_short_name",
		run:   fields.TripShortNameField,
	})
}
