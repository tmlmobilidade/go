package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestTripsRouteIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "trips_route_id_field",
		table: "trips",
		field: "route_id",
		run:   fields.TripsRouteIdField,
	})
}
