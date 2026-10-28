package routes_standard_test

import (
	"main/types"
	checks "main/validations/routes/standard/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestRouteColorValid(t *testing.T) {
	const id = "routes_route_color_valid"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{{"Uppercase", map[string]any{"route_color": "AABBCC"}, 0},
		{"Lowercase", map[string]any{"route_color": "aabbcc"}, 0},
		{"Black", map[string]any{"route_color": "000000"}, 0},
		{"White", map[string]any{"route_color": "FFFFFF"}, 0},
		{"Short", map[string]any{"route_color": "ABC"}, 1},
		{"Hash", map[string]any{"route_color": "#AABBCC"}, 1},
		{"NonHex", map[string]any{"route_color": "GG0000"}, 1},
		{"TooLong", map[string]any{"route_color": "FFFFFF0"}, 1},
		{"Empty", map[string]any{"route_color": ""}, 1},
		{"Null", map[string]any{"route_color": nil}, 1},
		{"MissingColumn", map[string]any{}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)

			if err := checks.RouteColorValid(ctx, config.Rule("routes_route_color_valid")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "route_color", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "route_color", checks.RouteColorValid, map[string]any{"route_color": "invalid"})
}
