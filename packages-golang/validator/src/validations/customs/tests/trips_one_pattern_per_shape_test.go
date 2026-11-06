package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/checks"
	"testing"
)

func TestTripsOnePatternPerShape(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_one_pattern_per_shape", table: "trips", field: "shape_id", run: custom.OnePatternPerShape, skipForbidden: true, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "P1", "shape_id": "S1"},
				{"pattern_id": "P1", "shape_id": "S1"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "P1", "shape_id": "S1"},
				{"pattern_id": "P2", "shape_id": "S1"},
			},
		}, wantRows: []int{1}},
		{name: "reports_own_conflict_independently", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "P1", "shape_id": "S1"},
				{"pattern_id": "P1", "shape_id": "S2"},
				{"pattern_id": "P2", "shape_id": "S1"},
			},
		}, wantRows: []int{1}},
	})
}
