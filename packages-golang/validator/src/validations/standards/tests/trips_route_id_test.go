package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestTripsRouteId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "trips_route_id_field",
		table: "trips",
		field: "route_id",
		run:   standard.TripsRouteIdField,
	})
}
