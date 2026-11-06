package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/checks"
	"testing"
)

func TestTripsTripHeadsignMaxTwoPerRoute(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_trip_headsign_max_two_per_route", table: "trips", field: "trip_headsign", run: custom.TripHeadsignMaxTwoPerRoute, skipForbidden: true, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"route_id": "R1", "trip_headsign": "A"},
				{"route_id": "R1", "trip_headsign": "B"},
				{"route_id": "R1", "trip_headsign": "A"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"route_id": "R1", "trip_headsign": "A"},
				{"route_id": "R1", "trip_headsign": "B"},
				{"route_id": "R1", "trip_headsign": "C"},
			},
		}, wantRows: []int{1}},
	})
}
