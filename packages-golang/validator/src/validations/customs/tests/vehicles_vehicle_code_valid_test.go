package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/checks"
	"testing"
)

func TestVehiclesVehicleCodeValid(t *testing.T) {
	checkCustom(t, customCheck{id: "vehicles_vehicle_code_valid", table: "vehicles", field: "vehicle_code", run: custom.VehicleCodeValid, skipForbidden: false, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"vehicles": {
				{"vehicle_code": "AA-00-AA", "vehicle_type": "3"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"vehicles": {
				{"vehicle_code": "INVALID", "vehicle_type": "3"},
			},
		}, wantRows: []int{1}},
		{name: "duplicate_in_same_type", tables: map[string][]map[string]any{
			"vehicles": {
				{"vehicle_code": "AA-00-AA", "vehicle_type": "3"},
				{"vehicle_code": "AA-00-AA", "vehicle_type": "3"},
			},
		}, wantRows: []int{1, 4}},
		{name: "same_code_in_distinct_types", tables: map[string][]map[string]any{
			"vehicles": {
				{"vehicle_code": "AA-00-AA", "vehicle_type": "3"},
				{"vehicle_code": "AA-00-AA", "vehicle_type": "11"},
			},
		}},
		{name: "ferry_mmsi", tables: map[string][]map[string]any{
			"vehicles": {
				{"vehicle_code": "263123456", "vehicle_type": "4"},
			},
		}},
	})
}
