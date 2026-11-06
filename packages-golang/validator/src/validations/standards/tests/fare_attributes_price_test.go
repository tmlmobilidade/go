package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestFareAttributesPrice(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "fare_attributes_price_field",
		table: "fare_attributes",
		field: "price",
		run:   standard.PriceField,
	})
}
