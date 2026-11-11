package custom_test

import (
	"testing"

	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
)

func TestTripsRouteIdPatternConsistent(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_route_id_pattern_consistent", table: "trips", field: "route_id", run: custom.RouteIdPatternConsistent, skipForbidden: true, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "P1", "route_id": "R1"},
				{"pattern_id": "P1", "route_id": "R1"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "P1", "route_id": "R1"},
				{"pattern_id": "P1", "route_id": "R2"},
			},
		}, wantRows: []int{1}},
	})
}
