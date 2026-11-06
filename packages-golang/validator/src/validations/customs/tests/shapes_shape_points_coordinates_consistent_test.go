package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/checks"
	"testing"
)

func TestShapesShapePointsCoordinatesConsistent(t *testing.T) {
	checkCustom(t, customCheck{id: "shapes_shape_point_spacing_valid", table: "shapes", field: "shape_pt_sequence", run: custom.ShapePointsCoordinatesConsistent, skipForbidden: false, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "0.1111949"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.02", "shape_dist_traveled": "2.2239"},
			},
		}, wantRows: []int{4}},
		{name: "invalid_coordinate_barrier", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "invalid", "shape_dist_traveled": "1"},
				{"shape_id": "S1", "shape_pt_sequence": "3", "shape_pt_lat": "0", "shape_pt_lon": "0.04", "shape_dist_traveled": "4"},
			},
		}},
		{name: "configured_tolerance", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.002", "shape_dist_traveled": "0.22239"},
			},
		}, wantRows: []int{4}, options: []string{"100"}},
	})
}
