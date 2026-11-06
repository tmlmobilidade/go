package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/checks"
	"testing"
)

func TestRoutesLineIdEqualRouteShortName(t *testing.T) {
	checkCustom(t, customCheck{id: "routes_line_id_equal_route_short_name", table: "routes", field: "line_id", run: custom.LineIdEqualRouteShortName, skipForbidden: false, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"routes": {
				{"line_id": "L1", "route_short_name": "L1"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"routes": {
				{"line_id": "L2", "route_short_name": "L1"},
			},
		}, wantRows: []int{1}},
	})
}
