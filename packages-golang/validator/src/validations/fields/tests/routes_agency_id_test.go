package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestRoutesAgencyIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_agency_id_field",
		table: "routes",
		field: "agency_id",
		run:   fields.RoutesAgencyIdField,
	})
}
