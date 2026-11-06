package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestTripsWheelchairAccessibleField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "trips_wheelchair_accessible_field",
		table: "trips",
		field: "wheelchair_accessible",
		run:   fields.TripsWheelchairAccessibleField,
	})
}
