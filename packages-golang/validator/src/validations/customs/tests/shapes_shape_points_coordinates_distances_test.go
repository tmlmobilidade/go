package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/checks"
	"testing"
)

func TestShapesShapePointsCoordinatesDistances(t *testing.T) {
	checkCustom(t, customCheck{id: "shapes_shape_dist_traveled_segment_valid", table: "shapes", field: "shape_dist_traveled", run: custom.ShapePointsCoordinatesDistances, skipForbidden: false, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "0.1111949"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "0.5"},
			},
		}, wantRows: []int{4}},
		{name: "explicit_meter_units", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "0"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "111.1949"},
			},
		}, options: []string{"20", "m"}},
		{name: "decrease_handled_separately", tables: map[string][]map[string]any{
			"shapes": {
				{"shape_id": "S1", "shape_pt_sequence": "1", "shape_pt_lat": "0", "shape_pt_lon": "0", "shape_dist_traveled": "1"},
				{"shape_id": "S1", "shape_pt_sequence": "2", "shape_pt_lat": "0", "shape_pt_lon": "0.001", "shape_dist_traveled": "0.5"},
			},
		}},
	})
}
