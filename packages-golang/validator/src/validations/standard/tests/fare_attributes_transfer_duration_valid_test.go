package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestTransferDurationValid(t *testing.T) {
	const id = "fare_attributes_transfer_duration_valid"
	for _, tc := range []struct {
		name  string
		value any
		count int
	}{
		{"Valid", "3600", 0},
		{"Empty", "", 1},
		{"Null", nil, 1},
		{"MissingColumn", nil, 1},
		{"Invalid", "-1", 1},
		{"Text", "abc", 1},
		{"Zero", "0", 0},
		{"Overflow", "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999", 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := validationutils.FareAttributesConfig(id, types.SEVERITY_ERROR)
			values := map[string]any{"transfer_duration": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "transfer_duration")
			}
			_, ctx := validationutils.FareAttributesFixture(t, values, config, "A1")

			if err := standard.TransferDurationValid(ctx, config.Rule("fare_attributes_transfer_duration_valid")); err != nil {
				t.Fatal(err)
			}
			validationutils.FareAttributesAssertFindings(t, id, "transfer_duration", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.FareAttributesCheckInvalid(t, id, "transfer_duration", standard.TransferDurationValid, map[string]any{"transfer_duration": "-1"})
}
