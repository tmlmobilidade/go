package fare_attributes_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_attributes/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_attributes/utils"
	"main/types"
	"testing"
)

func TestCurrencyTypeValid(t *testing.T) {
	const id = "fare_attributes_currency_type_valid"
	for _, tc := range []struct {
		name  string
		value any
		count int
	}{
		{"Valid", "EUR", 0},
		{"Empty", "", 1},
		{"Null", nil, 1},
		{"MissingColumn", nil, 1},
		{"Invalid", "INVALID", 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			values := map[string]any{"currency_type": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "currency_type")
			}
			_, ctx := testutils.Fixture(t, values, config, "A1")

			if err := checks.CurrencyTypeValid(ctx, config.Rule("fare_attributes_currency_type_valid")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "currency_type", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "currency_type", checks.CurrencyTypeValid, map[string]any{"currency_type": "INVALID"})
}
