package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestRoutesAgencyId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_agency_id_field",
		table: "routes",
		field: "agency_id",
		run:   standard.RoutesAgencyIdField,
	})
}
