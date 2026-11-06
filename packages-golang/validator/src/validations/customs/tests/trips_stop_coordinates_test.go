package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
	"testing"
)

/*
* TestTripsStopCoordinates checks served-stop distance findings and cached-result reporting.
* Stops near the sampled shape pass, distant stops produce findings, and
* a shared cached violation must still be reported for each affected trip.
 */
func TestTripsStopCoordinates(t *testing.T) {

	//
	// 1. Run the rule fixtures through the shared custom-validation test helper.

	checkCustom(t, customCheck{id: "trips_stop_coordinates", table: "trips", field: "stop_id", run: custom.StopCoordinates, skipForbidden: true, required: []string{"stop_times", "stops", "shapes"}}, []customCase{

		//
		// 2. Accept a stop located on the shape between its original vertices.

		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"trip_id": "T1", "shape_id": "S1"},
			},
			"stop_times": {
				{"trip_id": "T1", "stop_id": "A", "stop_sequence": "1", "shape_dist_traveled": "0"},
			},
			"stops": {
				{"stop_id": "A", "stop_lat": "0", "stop_lon": "0.0005"},
			},
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "0.1111949"},
			},
		}},

		//
		// 3. Report a served stop farther than the allowed distance from its shape.

		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"trip_id": "T1", "shape_id": "S1"},
			},
			"stop_times": {
				{"trip_id": "T1", "stop_id": "A", "stop_sequence": "1", "shape_dist_traveled": "0"},
			},
			"stops": {
				{"stop_id": "A", "stop_lat": "0.01", "stop_lon": "0.0005"},
			},
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "0.1111949"},
			},
		}, wantRows: []int{1}},

		//
		// 4. Report both trips when they share the same distant stop and shape.

		{name: "cached_violation_reports_each_trip", tables: map[string][]map[string]any{
			"trips": {
				{"trip_id": "T1", "shape_id": "S1"},
				{"trip_id": "T2", "shape_id": "S1"},
			},
			"stop_times": {
				{"trip_id": "T1", "stop_id": "A", "stop_sequence": "1", "shape_dist_traveled": "0"},
				{"trip_id": "T2", "stop_id": "A", "stop_sequence": "1", "shape_dist_traveled": "0"},
			},
			"stops": {
				{"stop_id": "A", "stop_lat": "0.01", "stop_lon": "0.0005"},
			},
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "0.1111949"},
			},
		}, wantRows: []int{1, 4}},
	})
}
