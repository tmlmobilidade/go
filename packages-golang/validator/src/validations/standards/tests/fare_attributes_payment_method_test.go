package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestFareAttributesPaymentMethod(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "fare_attributes_payment_method_field",
		table: "fare_attributes",
		field: "payment_method",
		run:   standard.PaymentMethodField,
	})
}
