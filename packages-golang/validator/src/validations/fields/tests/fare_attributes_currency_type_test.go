package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestCurrencyTypeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "fare_attributes_currency_type_field",
		table: "fare_attributes",
		field: "currency_type",
		run:   fields.CurrencyTypeField,
	})
}
