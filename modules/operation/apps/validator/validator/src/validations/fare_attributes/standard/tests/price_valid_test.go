package fare_attributes_standard_test

import (
	"main/types"
	checks "main/validations/fare_attributes/standard/checks"
	testutils "main/validations/fare_attributes/utils"
	"testing"
)

func TestPriceValid(t *testing.T) {
	const id = "fare_price_valid_non_negative_decimal"
	for _, tc := range []struct {
		name  string
		value any
		count int
	}{
		{"Valid", "2.50", 0},
		{"Empty", "", 1},
		{"Null", nil, 1},
		{"MissingColumn", nil, 1},
		{"Invalid", "-1", 1},
		{"Text", "abc", 1},
		{"Zero", "0", 0},
		{"Overflow", "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999", 1},
		{"NaN", "NaN", 1},
		{"Infinity", "+Inf", 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			values := map[string]any{"price": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "price")
			}
			_, ctx := testutils.Fixture(t, values, config, "A1")

			if err := checks.PriceValid(ctx, config.Rule("fare_price_valid_non_negative_decimal")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "price", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "price", checks.PriceValid, map[string]any{"price": "-1"})
}
