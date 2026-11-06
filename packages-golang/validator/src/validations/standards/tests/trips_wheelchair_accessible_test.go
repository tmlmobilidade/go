package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestTripsWheelchairAccessible(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "trips_wheelchair_accessible_field",
		table: "trips",
		field: "wheelchair_accessible",
		run:   standard.TripsWheelchairAccessibleField,
	})
}
