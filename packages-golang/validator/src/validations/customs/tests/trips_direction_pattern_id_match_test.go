package custom_test

import (
	"testing"

	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
)

func TestTripsDirectionPatternIdMatch(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_direction_pattern_id_match", table: "trips", field: "direction_pattern_id_match", run: custom.DirectionPatternIdMatch, skipForbidden: true, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "1001_0_1", "direction_id": "0"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "1001_0_1", "direction_id": "1"},
			},
		}, wantRows: []int{1}},
		{name: "invalid_direction_is_separate", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "1001_0_1", "direction_id": "bad"},
			},
		}},
		{name: "missing_direction", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "1001_0_1", "direction_id": ""},
			},
		}, wantRows: []int{1}},
	})
}
