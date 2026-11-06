package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestVehiclesAgencyId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "vehicles_agency_id_field",
		table: "vehicles",
		field: "agency_id",
		run:   standard.VehiclesAgencyIdField,
	})
}
