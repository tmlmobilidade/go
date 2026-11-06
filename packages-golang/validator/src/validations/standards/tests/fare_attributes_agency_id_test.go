package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestFareAttributesAgencyId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "fare_attributes_agency_id_field",
		table: "fare_attributes",
		field: "agency_id",
		run:   standard.FareAttributesAgencyIdField,
	})
}
