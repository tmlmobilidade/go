package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestTransfersToStopIdValid(t *testing.T) {
	const id = "transfers_to_stop_id_foreign"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{
		{"A", map[string]any{"to_stop_id": "A", "transfer_type": "2"}, 0},
		{"station", map[string]any{"to_stop_id": "station", "transfer_type": "2"}, 0},
		{"entrance", map[string]any{"to_stop_id": "entrance", "transfer_type": "2"}, 1},
		{"default", map[string]any{"to_stop_id": "default", "transfer_type": "2"}, 0},
		{"bad", map[string]any{"to_stop_id": "bad", "transfer_type": "2"}, 0},
		{"missing", map[string]any{"to_stop_id": "missing", "transfer_type": "2"}, 1},
		{"' OR 1=1 --", map[string]any{"to_stop_id": "' OR 1=1 --", "transfer_type": "2"}, 1},
		{"", map[string]any{"to_stop_id": "", "transfer_type": "2"}, 0},
		{"None", map[string]any{"to_stop_id": nil, "transfer_type": "2"}, 0},
		{"4station", map[string]any{"to_stop_id": "station", "transfer_type": "4"}, 1},
		{"4A", map[string]any{"to_stop_id": "A", "transfer_type": "4"}, 0},
		{"4default", map[string]any{"to_stop_id": "default", "transfer_type": "4"}, 0},
		{"5station", map[string]any{"to_stop_id": "station", "transfer_type": "5"}, 1},
		{"5A", map[string]any{"to_stop_id": "A", "transfer_type": "5"}, 0},
		{"5default", map[string]any{"to_stop_id": "default", "transfer_type": "5"}, 0},
		{"SameStop", map[string]any{"to_stop_id": "A", "from_stop_id": "A", "transfer_type": "2"}, 1},
		{"DifferentStops", map[string]any{"to_stop_id": "B", "from_stop_id": "A", "transfer_type": "2"}, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := validationutils.TransfersConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.TransfersFixture(t, tc.values, config)
			if err := standard.TransfersToStopIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.TransfersAssertFindings(t, id, "to_stop_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.TransfersCheckInvalid(t, id, "to_stop_id", standard.TransfersToStopIdForeign, map[string]any{"to_stop_id": "missing"})
}
