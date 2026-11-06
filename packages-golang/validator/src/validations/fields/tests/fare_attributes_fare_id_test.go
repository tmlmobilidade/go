package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestFareAttributesFareIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "fare_attributes_fare_id_field",
		table: "fare_attributes",
		field: "fare_id",
		run:   fields.FareAttributesFareIdField,
	})
}
