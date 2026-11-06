package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/checks"
	"testing"
)

/*
* TestShapesShapePointsCoordinatesDistances checks recorded increments against Haversine segments.
* The cases cover the first segment from zero, mismatched increments,
* explicit meter units, and decreases handled by a separate rule.
 */
func TestShapesShapePointsCoordinatesDistances(t *testing.T) {

	//
	// 1. Run the rule fixtures through the shared custom-validation test helper.

	checkCustom(t, customCheck{id: "shapes_shape_dist_traveled_segment_valid", table: "shapes", field: "shape_dist_traveled", run: custom.ShapePointsCoordinatesDistances, skipForbidden: false, required: []string{}}, []customCase{

		//
		// 2. Accept a recorded kilometer increment matching the segment from zero.

		{name: "valid", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "0.1111949"},
			},
		}},

		//
		// 3. Report an increment that exceeds the geometric segment beyond tolerance.

		{name: "invalid", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "0.5"},
			},
		}, wantRows: []int{4}},

		//
		// 4. Honor explicit meters for a small distance the heuristic would treat as km.

		{name: "explicit_meter_units", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "111.1949"},
			},
		}, options: []string{"20", "m"}},

		//
		// 5. Leave decreasing recorded distances to the monotonic-distance rule.

		{name: "decrease_handled_separately", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "1"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "0.5"},
			},
		}},
	})
}
