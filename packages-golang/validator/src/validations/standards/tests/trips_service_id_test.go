package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestTripsServiceId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "trips_service_id_field",
		table: "trips",
		field: "service_id",
		run:   standard.TripsServiceIdField,
	})
}
