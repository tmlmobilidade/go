package custom_test

import (
	"testing"

	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
)

func TestTripsShapeIdRouteDirectionConsistent(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_shape_id_route_direction_consistent", table: "trips", field: "shape_id", run: custom.ShapeIdRouteDirectionConsistent, skipForbidden: true, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"route_id": "R1", "direction_id": "0", "shape_id": "A"},
				{"route_id": "R1", "direction_id": "1", "shape_id": "B"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"route_id": "R1", "direction_id": "0", "shape_id": "A"},
				{"route_id": "R1", "direction_id": "0", "shape_id": "B"},
			},
		}, wantRows: []int{1}},
	})
}
