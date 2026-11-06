package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestPaymentMethodField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "fare_attributes_payment_method_field",
		table: "fare_attributes",
		field: "payment_method",
		run:   fields.PaymentMethodField,
	})
}
