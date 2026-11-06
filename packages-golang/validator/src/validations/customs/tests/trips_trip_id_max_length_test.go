package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
	"testing"
)

func TestTripsTripIdMaxLength(t *testing.T) {
	checkCustom(t, customCheck{id: "trips_trip_id_max_length", table: "trips", field: "trip_id_limit_characters", run: custom.TripIdMaxLength, skipForbidden: false, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"trips": {
				{"trip_id": "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"trips": {
				{"trip_id": "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT"},
			},
		}, wantRows: []int{1}},
	})
}
