package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestTransfersValid(t *testing.T) {
	const id = "fare_attributes_transfers_valid"
	for _, tc := range []struct {
		name  string
		value any
		count int
	}{
		{"Valid", "2", 0},
		{"Empty", "", 1},
		{"Null", nil, 1},
		{"MissingColumn", nil, 1},
		{"Invalid", "3", 1},
		{"Text", "abc", 1},
		{"Zero", "0", 0},
		{"Overflow", "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999", 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := validationutils.FareAttributesConfig(id, types.SEVERITY_ERROR)
			values := map[string]any{"transfers": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "transfers")
			}
			_, ctx := validationutils.FareAttributesFixture(t, values, config, "A1")

			if err := standard.TransfersValid(ctx, config.Rule("fare_attributes_transfers_valid")); err != nil {
				t.Fatal(err)
			}
			validationutils.FareAttributesAssertFindings(t, id, "transfers", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.FareAttributesCheckInvalid(t, id, "transfers", standard.TransfersValid, map[string]any{"transfers": "3"})
}
