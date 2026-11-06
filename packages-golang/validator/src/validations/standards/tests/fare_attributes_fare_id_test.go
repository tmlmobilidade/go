package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestFareAttributesFareId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "fare_attributes_fare_id_field",
		table: "fare_attributes",
		field: "fare_id",
		run:   standard.FareAttributesFareIdField,
	})
}
