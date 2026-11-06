package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestTripsServiceIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "trips_service_id_field",
		table: "trips",
		field: "service_id",
		run:   fields.TripsServiceIdField,
	})
}
