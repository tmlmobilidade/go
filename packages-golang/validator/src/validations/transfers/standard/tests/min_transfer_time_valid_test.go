package transfers_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/transfers/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/transfers/utils"
	"main/types"
	"testing"
)

func TestMinTransferTimeValid(t *testing.T) {
	const id = "transfers_min_transfer_time_valid"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{
		{"0", map[string]any{"min_transfer_time": "0"}, 0},
		{"1", map[string]any{"min_transfer_time": "1"}, 0},
		{"3600", map[string]any{"min_transfer_time": "3600"}, 0},
		{"", map[string]any{"min_transfer_time": ""}, 0},
		{"None", map[string]any{"min_transfer_time": nil}, 0},
		{"-1", map[string]any{"min_transfer_time": "-1"}, 1},
		{"bad", map[string]any{"min_transfer_time": "bad"}, 1},
		{"1.5", map[string]any{"min_transfer_time": "1.5"}, 1},
		{"999999999999999999999999", map[string]any{"min_transfer_time": "999999999999999999999999"}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)
			if err := checks.MinTransferTimeValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "min_transfer_time", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "min_transfer_time", checks.MinTransferTimeValid, map[string]any{"min_transfer_time": "missing"})
}
