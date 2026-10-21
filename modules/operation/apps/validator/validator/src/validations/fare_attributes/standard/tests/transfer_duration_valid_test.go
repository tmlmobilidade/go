package fare_attributes_standard_test

import (
	"main/types"
	checks "main/validations/fare_attributes/standard/checks"
	testutils "main/validations/fare_attributes/utils"
	"testing"
)

func TestTransferDurationValid(t *testing.T) {
	const id = "fare_attributes_transfer_duration_valid_seconds_range"
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
			config := testutils.Config(id, types.SEVERITY_ERROR)
			values := map[string]any{"transfer_duration": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "transfer_duration")
			}
			_, ctx := testutils.Fixture(t, values, config, "A1")

			if err := checks.TransferDurationValid(ctx, config.Rule("fare_attributes_transfer_duration_valid_seconds_range")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "transfer_duration", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "transfer_duration", checks.TransferDurationValid, map[string]any{"transfer_duration": "-1"})
}
