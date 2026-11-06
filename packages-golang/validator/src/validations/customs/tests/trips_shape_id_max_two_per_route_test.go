package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/checks"
	"testing"
)

func TestTripsShapeIdMaxTwoPerRoute(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_shape_id_max_two_per_route", table: "trips", field: "shape_id", run: custom.ShapeIdMaxTwoPerRoute, skipForbidden: true, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"route_id": "R1", "shape_id": "A"},
				{"route_id": "R1", "shape_id": "B"},
				{"route_id": "R1", "shape_id": "A"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"route_id": "R1", "shape_id": "A"},
				{"route_id": "R1", "shape_id": "B"},
				{"route_id": "R1", "shape_id": "C"},
			},
		}, wantRows: []int{1}},
	})
}
