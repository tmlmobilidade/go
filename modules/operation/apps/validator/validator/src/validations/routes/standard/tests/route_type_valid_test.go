package routes_standard_test

import (
	"main/types"
	checks "main/validations/routes/standard/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestRouteTypeValid(t *testing.T) {
	const id = "routes_route_type_valid"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{{"Allowed1", map[string]any{"route_type": "1"}, 0},
		{"Allowed2", map[string]any{"route_type": "2"}, 0},
		{"Allowed3", map[string]any{"route_type": "3"}, 0},
		{"Allowed4", map[string]any{"route_type": "4"}, 0},
		{"Allowed5", map[string]any{"route_type": "5"}, 0},
		{"Allowed6", map[string]any{"route_type": "6"}, 0},
		{"Allowed7", map[string]any{"route_type": "7"}, 0},
		{"Allowed11", map[string]any{"route_type": "11"}, 0},
		{"Allowed12", map[string]any{"route_type": "12"}, 0},
		{"Invalid0", map[string]any{"route_type": "0"}, 1},
		{"Invalid-1", map[string]any{"route_type": "-1"}, 1},
		{"Invalid13", map[string]any{"route_type": "13"}, 1},
		{"Invalid1.0", map[string]any{"route_type": "1.0"}, 1},
		{"Invalid 1", map[string]any{"route_type": " 1"}, 1},
		{"Invalidtext", map[string]any{"route_type": "text"}, 1},
		{"Empty", map[string]any{"route_type": ""}, 1},
		{"Null", map[string]any{"route_type": nil}, 1},
		{"MissingColumn", map[string]any{}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)

			if err := checks.RouteTypeValid(ctx, config); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "route_type", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "route_type", checks.RouteTypeValid, map[string]any{"route_type": "invalid"})
}
