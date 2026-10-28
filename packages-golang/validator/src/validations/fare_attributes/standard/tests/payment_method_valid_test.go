package fare_attributes_standard_test

import (
	"main/types"
	checks "main/validations/fare_attributes/standard/checks"
	testutils "main/validations/fare_attributes/utils"
	"testing"
)

func TestPaymentMethodValid(t *testing.T) {
	const id = "fare_attributes_payment_method_valid"
	for _, tc := range []struct {
		name  string
		value any
		count int
	}{
		{"Valid", "0", 0},
		{"Empty", "", 1},
		{"Null", nil, 1},
		{"MissingColumn", nil, 1},
		{"Invalid", "2", 1},
		{"Text", "abc", 1},
		{"Zero", "0", 0},
		{"Overflow", "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999", 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			values := map[string]any{"payment_method": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "payment_method")
			}
			_, ctx := testutils.Fixture(t, values, config, "A1")

			if err := checks.PaymentMethodValid(ctx, config.Rule("fare_attributes_payment_method_valid")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "payment_method", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "payment_method", checks.PaymentMethodValid, map[string]any{"payment_method": "2"})
}
