package custom_test

import (
	"testing"

	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
)

/*
* TestShapesShapePointsCoordinatesConsistent checks spacing between consecutive shape coordinates.
* The cases cover the default limit, invalid-coordinate barriers, and an
* explicit tolerance, with findings tied to their original source rows.
 */
func TestShapesShapePointsCoordinatesConsistent(t *testing.T) {

	//
	// 1. Run the rule fixtures through the shared custom-validation test helper.

	checkCustom(t, customCheck{id: "shapes_shape_point_spacing_valid", table: "shapes", field: "shape_pt_sequence", run: custom.ShapePointsCoordinatesConsistent, skipForbidden: false, required: []string{}}, []customCase{

		//
		// 2. Accept adjacent points about 111 meters apart under the default limit.

		{name: "valid", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "0.1111949"},
			},
		}},

		//
		// 3. Report a coordinate gap above the default spacing limit.

		{name: "invalid", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.02", "shape_dist_traveled": "2.2239"},
			},
		}, wantRows: []int{4}},

		//
		// 4. Skip invalid adjacent coordinates without joining across the invalid point.

		{name: "invalid_coordinate_barrier", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "invalid", "shape_dist_traveled": "1"},
				{"shape_id": "S1", "shape_pt_sequence": "3", "shape_pt_lat": "0", "shape_pt_lon": "0.04", "shape_dist_traveled": "4"},
			},
		}},

		//
		// 5. Report a gap of about 222 meters when tolerance is set to 100 meters.

		{name: "configured_tolerance", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.002", "shape_dist_traveled": "0.22239"},
			},
		}, wantRows: []int{4}, options: []string{"100"}},
	})
}
