package fare_attributes_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_attributes/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_attributes/utils"
	"main/types"
	"testing"
)

func TestPriceValid(t *testing.T) {
	const id = "fare_attributes_price_valid"
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

			if err := checks.PriceValid(ctx, config.Rule("fare_attributes_price_valid")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "price", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "price", checks.PriceValid, map[string]any{"price": "-1"})
}
