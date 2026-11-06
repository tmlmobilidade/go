package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/checks"
	"testing"
)

func TestTripsPatternSingleSignature(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_pattern_single_signature", table: "trips", field: "pattern_id", run: custom.PatternSingleSignature, skipForbidden: true, required: []string{"stop_times"}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"trip_id": "T1", "pattern_id": "P1"},
				{"trip_id": "T2", "pattern_id": "P1"},
			},
			"stop_times": {
				{"trip_id": "T1", "stop_id": "S1", "stop_sequence": "1", "shape_dist_traveled": "0"},
				{"trip_id": "T1", "stop_id": "S2", "stop_sequence": "2", "shape_dist_traveled": "0"},
				{"trip_id": "T2", "stop_id": "S1", "stop_sequence": "1", "shape_dist_traveled": "0"},
				{"trip_id": "T2", "stop_id": "S2", "stop_sequence": "2", "shape_dist_traveled": "0"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"trip_id": "T1", "pattern_id": "P1"},
				{"trip_id": "T2", "pattern_id": "P1"},
			},
			"stop_times": {
				{"trip_id": "T1", "stop_id": "S1", "stop_sequence": "1", "shape_dist_traveled": "0"},
				{"trip_id": "T1", "stop_id": "S2", "stop_sequence": "2", "shape_dist_traveled": "0"},
				{"trip_id": "T2", "stop_id": "S1", "stop_sequence": "1", "shape_dist_traveled": "0"},
				{"trip_id": "T2", "stop_id": "S3", "stop_sequence": "2", "shape_dist_traveled": "0"},
			},
		}, wantRows: []int{1}},
	})
}
