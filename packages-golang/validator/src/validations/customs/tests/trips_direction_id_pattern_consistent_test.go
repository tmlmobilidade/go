package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
	"testing"
)

func TestTripsDirectionIdPatternConsistent(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_direction_id_pattern_consistent", table: "trips", field: "direction_id", run: custom.DirectionIdPatternConsistent, skipForbidden: true, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "P1", "direction_id": "0"},
				{"pattern_id": "P1", "direction_id": "00"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "P1", "direction_id": "0"},
				{"pattern_id": "P1", "direction_id": "1"},
			},
		}, wantRows: []int{1}},
	})
}
