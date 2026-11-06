package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestPriceField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "fare_attributes_price_field",
		table: "fare_attributes",
		field: "price",
		run:   fields.PriceField,
	})
}
