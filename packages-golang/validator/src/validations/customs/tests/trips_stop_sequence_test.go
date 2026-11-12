package custom_test

import (
	"testing"

	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
)

func TestTripsStopSequence(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_stop_sequence", table: "trips", field: "stop_sequence", run: custom.StopSequence, skipForbidden: true, required: []string{"stop_times"}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"trip_id": "T1"},
			},
			"stop_times": {
				{"trip_id": "T1", "stop_id": "S1", "stop_sequence": "1", "shape_dist_traveled": "0"},
				{"trip_id": "T1", "stop_id": "S2", "stop_sequence": "3", "shape_dist_traveled": "0"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"trip_id": "T1"},
			},
			"stop_times": {
				{"trip_id": "T1", "stop_id": "S1", "stop_sequence": "1", "shape_dist_traveled": "0"},
				{"trip_id": "T1", "stop_id": "S2", "stop_sequence": "1", "shape_dist_traveled": "0"},
			},
		}, wantRows: []int{1}},
		{name: "repeated_consecutive_stop", tables: map[string][]map[string]any{
			"trips": {
				{"trip_id": "T1"},
			},
			"stop_times": {
				{"trip_id": "T1", "stop_id": "S1", "stop_sequence": "1", "shape_dist_traveled": "0"},
				{"trip_id": "T1", "stop_id": "S1", "stop_sequence": "2", "shape_dist_traveled": "0"},
			},
		}, wantRows: []int{1}},
		{name: "distance_decreases", tables: map[string][]map[string]any{
			"trips": {
				{"trip_id": "T1"},
			},
			"stop_times": {
				{"trip_id": "T1", "stop_id": "S1", "stop_sequence": "1", "shape_dist_traveled": "10"},
				{"trip_id": "T1", "stop_id": "S2", "stop_sequence": "2", "shape_dist_traveled": "9"},
			},
		}, wantRows: []int{1}},
	})
}
