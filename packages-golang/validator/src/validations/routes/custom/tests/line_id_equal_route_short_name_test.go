package routes_custom_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/routes/custom/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/routes/utils"
	"main/types"
	"testing"
)

func TestLineIdEqualRouteShortName(t *testing.T) {
	const id = "routes_line_id_equal_route_short_name"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{{"Equal", map[string]any{"line_id": "100", "route_short_name": "100"}, 0},
		{"Different", map[string]any{"line_id": "100", "route_short_name": "200"}, 1},
		{"MissingComparison", map[string]any{"line_id": "100"}, 1},
		{"Empty", map[string]any{"line_id": ""}, 0},
		{"Null", map[string]any{"line_id": nil}, 0},
		{"MissingColumn", map[string]any{}, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)

			if err := checks.LineIdEqualRouteShortName(ctx, config.Rule("routes_line_id_equal_route_short_name")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "line_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "line_id", checks.LineIdEqualRouteShortName, map[string]any{"line_id": "100", "route_short_name": "200"})
}
