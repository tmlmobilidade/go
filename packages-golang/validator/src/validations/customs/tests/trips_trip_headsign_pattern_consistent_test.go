package custom_test

import (
	"testing"

	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
)

func TestTripsTripHeadsignPatternConsistent(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_trip_headsign_pattern_consistent", table: "trips", field: "trip_headsign", run: custom.TripHeadsignPatternConsistent, skipForbidden: true, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "P1", "trip_headsign": "Centre"},
				{"pattern_id": "P1", "trip_headsign": "Centre"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"pattern_id": "P1", "trip_headsign": "Centre"},
				{"pattern_id": "P1", "trip_headsign": ""},
			},
		}, wantRows: []int{1}},
	})
}
