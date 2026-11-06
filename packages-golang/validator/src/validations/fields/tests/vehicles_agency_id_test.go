package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestVehiclesAgencyIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "vehicles_agency_id_field",
		table: "vehicles",
		field: "agency_id",
		run:   fields.VehiclesAgencyIdField,
	})
}
