package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
	"testing"
)

func TestTripsShapeIdRouteDirectionMatch(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_shape_id_route_direction_match", table: "trips", field: "shape_id", run: custom.ShapeIdRouteDirectionMatch, skipForbidden: true, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"shape_id": "R1_0", "route_id": "R1", "direction_id": "0"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"shape_id": "S1", "route_id": "R1", "direction_id": "0"},
			},
		}, wantRows: []int{1}},
	})
}
