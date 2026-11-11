package custom_test

import (
	"testing"

	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
)

func TestRoutesLineShortNameEqualRouteShortName(t *testing.T) {
	checkCustom(t, customCheck{id: "routes_line_short_name_equal_route_short_name", table: "routes", field: "line_short_name", run: custom.LineShortNameEqualRouteShortName, skipForbidden: false, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"routes": {
				{"line_short_name": "L1", "route_short_name": "L1"},
			},
		}},
		{name: "invalid", tables: map[string][]map[string]any{
			"routes": {
				{"line_short_name": "L2", "route_short_name": "L1"},
			},
		}, wantRows: []int{1}},
	})
}
