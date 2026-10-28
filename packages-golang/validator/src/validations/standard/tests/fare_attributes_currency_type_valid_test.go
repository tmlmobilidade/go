package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
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
			config := validationutils.FareAttributesConfig(id, types.SEVERITY_ERROR)
			values := map[string]any{"currency_type": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "currency_type")
			}
			_, ctx := validationutils.FareAttributesFixture(t, values, config, "A1")

			if err := standard.CurrencyTypeValid(ctx, config.Rule("fare_attributes_currency_type_valid")); err != nil {
				t.Fatal(err)
			}
			validationutils.FareAttributesAssertFindings(t, id, "currency_type", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.FareAttributesCheckInvalid(t, id, "currency_type", standard.CurrencyTypeValid, map[string]any{"currency_type": "INVALID"})
}
