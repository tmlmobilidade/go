package routes_custom_test

import (
	"main/types"
	checks "main/validations/routes/custom/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestLineShortNameEqualRouteShortName(t *testing.T) {
	const id = "routes_line_short_name_equal_route_short_name"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{{"Equal", map[string]any{"line_short_name": "100", "route_short_name": "100"}, 0},
		{"Different", map[string]any{"line_short_name": "100", "route_short_name": "200"}, 1},
		{"MissingComparison", map[string]any{"line_short_name": "100"}, 1},
		{"Empty", map[string]any{"line_short_name": ""}, 0},
		{"Null", map[string]any{"line_short_name": nil}, 0},
		{"MissingColumn", map[string]any{}, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)

			if err := checks.LineShortNameEqualRouteShortName(ctx, config); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "line_short_name", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "line_short_name", checks.LineShortNameEqualRouteShortName, map[string]any{"line_short_name": "100", "route_short_name": "200"})
}
