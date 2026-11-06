package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/checks"
	"testing"
)

func TestTripsPatternRequiredFields(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_pattern_required_fields", table: "trips", field: "pattern_id", run: custom.PatternRequiredFields, skipForbidden: true, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"trip_id": "T1", "pattern_id": "P1", "route_id": "R1", "direction_id": "0", "shape_id": "S1", "trip_headsign": "Centre"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"trip_id": "T1", "pattern_id": "P1", "route_id": "", "direction_id": "0", "shape_id": "", "trip_headsign": "Centre"},
				{"trip_id": "T2", "pattern_id": "P1", "route_id": "R1", "direction_id": "0", "shape_id": "S1", "trip_headsign": ""},
			},
		}, wantRows: []int{1, 4}},
	})
}
