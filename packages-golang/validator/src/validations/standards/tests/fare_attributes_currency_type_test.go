package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestFareAttributesCurrencyType(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "fare_attributes_currency_type_field",
		table: "fare_attributes",
		field: "currency_type",
		run:   standard.CurrencyTypeField,
	})
}
