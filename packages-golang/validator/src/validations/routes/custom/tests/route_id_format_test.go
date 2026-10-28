package routes_custom_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/routes/custom/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/routes/utils"
	"main/types"
	"testing"
)

func TestRouteIdFormat(t *testing.T) {
	const id = "routes_route_id_format"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{{"Matching", map[string]any{"route_id": "100_2", "route_short_name": "100", "route_sort_order": "2"}, 0},
		{"WrongID", map[string]any{"route_id": "other", "route_short_name": "100", "route_sort_order": "2"}, 1},
		{"ZeroSortOrder", map[string]any{"route_id": "100_0", "route_short_name": "100", "route_sort_order": "0"}, 0},
		{"Empty", map[string]any{"route_id": ""}, 1},
		{"Null", map[string]any{"route_id": nil}, 1},
		{"MissingColumn", map[string]any{}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)

			if err := checks.RouteIdFormat(ctx, config.Rule("routes_route_id_format")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "route_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "route_id", checks.RouteIdFormat, map[string]any{"route_id": "other", "route_short_name": "100", "route_sort_order": "2"})
}
