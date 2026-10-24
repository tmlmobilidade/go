package fare_attributes_fields_test

import (
	checks "main/validations/fare_attributes/fields/checks"
	testutils "main/validations/fare_attributes/utils"
	"testing"
)

func TestPaymentMethodField(t *testing.T) {
	testutils.CheckPresence(t, "payment_method", checks.PaymentMethodField)
}
