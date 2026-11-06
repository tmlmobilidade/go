package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
	"testing"
)

func TestRoutesRouteIdFormat(t *testing.T) {
	checkCustom(t, customCheck{id: "routes_route_id_format", table: "routes", field: "route_id", run: custom.RouteIdFormat, skipForbidden: false, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"routes": {
				{"route_id": "L1_0", "route_short_name": "L1", "route_sort_order": "0"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"routes": {
				{"route_id": "other", "route_short_name": "L1", "route_sort_order": "0"},
			},
		}, wantRows: []int{1}},
	})
}
