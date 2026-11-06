package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestFareAttributesAgencyIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "fare_attributes_agency_id_field",
		table: "fare_attributes",
		field: "agency_id",
		run:   fields.FareAttributesAgencyIdField,
	})
}
