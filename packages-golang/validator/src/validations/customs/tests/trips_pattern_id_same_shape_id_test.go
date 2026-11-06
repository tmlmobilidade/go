package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/checks"
	"testing"
)

func TestTripsPatternIdSameShapeId(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_pattern_id_same_shape_id", table: "trips", field: "pattern_id", run: custom.PatternIdSameShapeId, skipForbidden: true, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "S1", "shape_id": "S1"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "P1", "shape_id": "S1"},
			},
		}, wantRows: []int{1}},
	})
}
