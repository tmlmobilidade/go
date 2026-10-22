package transfers_standard_test

import (
	"main/types"
	checks "main/validations/transfers/standard/checks"
	testutils "main/validations/transfers/utils"
	"testing"
)

func TestFromStopIdValid(t *testing.T) {
	const id = "transfer_from_stop_id_references_stops_table"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{
		{"A", map[string]any{"from_stop_id": "A", "transfer_type": "2"}, 0},
		{"station", map[string]any{"from_stop_id": "station", "transfer_type": "2"}, 0},
		{"entrance", map[string]any{"from_stop_id": "entrance", "transfer_type": "2"}, 1},
		{"default", map[string]any{"from_stop_id": "default", "transfer_type": "2"}, 0},
		{"bad", map[string]any{"from_stop_id": "bad", "transfer_type": "2"}, 0},
		{"missing", map[string]any{"from_stop_id": "missing", "transfer_type": "2"}, 1},
		{"' OR 1=1 --", map[string]any{"from_stop_id": "' OR 1=1 --", "transfer_type": "2"}, 1},
		{"", map[string]any{"from_stop_id": "", "transfer_type": "2"}, 0},
		{"None", map[string]any{"from_stop_id": nil, "transfer_type": "2"}, 0},
		{"4station", map[string]any{"from_stop_id": "station", "transfer_type": "4"}, 1},
		{"4A", map[string]any{"from_stop_id": "A", "transfer_type": "4"}, 0},
		{"4default", map[string]any{"from_stop_id": "default", "transfer_type": "4"}, 0},
		{"5station", map[string]any{"from_stop_id": "station", "transfer_type": "5"}, 1},
		{"5A", map[string]any{"from_stop_id": "A", "transfer_type": "5"}, 0},
		{"5default", map[string]any{"from_stop_id": "default", "transfer_type": "5"}, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)
			if err := checks.FromStopIdValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "from_stop_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "from_stop_id", checks.FromStopIdValid, map[string]any{"from_stop_id": "missing"})
}
