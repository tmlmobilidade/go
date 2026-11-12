package custom_test

import (
	"testing"

	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
)

func TestTripsTripHeadsignRouteDirectionConsistent(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_trip_headsign_route_direction_consistent", table: "trips", field: "trip_headsign", run: custom.TripHeadsignRouteDirectionConsistent, skipForbidden: true, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"route_id": "R1", "direction_id": "0", "trip_headsign": "A"},
				{"route_id": "R1", "direction_id": "1", "trip_headsign": "B"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"route_id": "R1", "direction_id": "0", "trip_headsign": "A"},
				{"route_id": "R1", "direction_id": "0", "trip_headsign": "B"},
			},
		}, wantRows: []int{1}},
	})
}
