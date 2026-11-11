package custom_test

import (
	"testing"

	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
)

/*
* TestShapesShapeDistancesValid checks recorded totals against complete shape-block geometry.
* The cases distinguish matching totals, accumulated drift across individually
* acceptable segments, and blocks suppressed by an existing segment mismatch.
 */
func TestShapesShapeDistancesValid(t *testing.T) {

	//
	// 1. Run the rule fixtures through the shared custom-validation test helper.

	checkCustom(t, customCheck{id: "shapes_shape_dist_traveled_block_valid", table: "shapes", field: "shape_dist_traveled", run: custom.ShapeDistancesValid, skipForbidden: false, required: []string{}}, []customCase{

		//
		// 2. Accept a block whose recorded total matches its Haversine length.

		{name: "valid", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "0.1111949"},
			},
		}},

		//
		// 3. Report accumulated drift above the block limit despite acceptable segments.

		{name: "invalid", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "0.25"},
				{"shape_id": "S1", "shape_pt_sequence": "3", "shape_pt_lat": "0", "shape_pt_lon": "0.002", "shape_dist_traveled": "0.5"},
				{"shape_id": "S1", "shape_pt_sequence": "4", "shape_pt_lat": "0", "shape_pt_lon": "0.003", "shape_dist_traveled": "0.75"},
			},
		}, wantRows: []int{10}},

		//
		// 4. Skip the block finding when one segment already exceeds its tolerance.

		{name: "segment_error_suppresses_block", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "0.5"},
			},
		}},
	})
}
