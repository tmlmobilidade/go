package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
	"testing"
)

func TestTripsOneShapePerPattern(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_one_shape_per_pattern", table: "trips", field: "shape_id", run: custom.OneShapePerPattern, skipForbidden: true, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "P1", "shape_id": "S1"},
				{"pattern_id": "P1", "shape_id": "S1"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "P1", "shape_id": "S1"},
				{"pattern_id": "P1", "shape_id": "S2"},
			},
		}, wantRows: []int{1}},
	})
}
