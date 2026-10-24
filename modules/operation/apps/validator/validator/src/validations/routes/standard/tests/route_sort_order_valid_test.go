package routes_standard_test

import (
	"main/types"
	checks "main/validations/routes/standard/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestRouteSortOrderValid(t *testing.T) {
	const id = "routes_route_sort_order_valid"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{{"Zero", map[string]any{"route_sort_order": "0"}, 0},
		{"Positive", map[string]any{"route_sort_order": "10"}, 0},
		{"Negative", map[string]any{"route_sort_order": "-1"}, 1},
		{"Decimal", map[string]any{"route_sort_order": "1.5"}, 1},
		{"Text", map[string]any{"route_sort_order": "abc"}, 1},
		{"Overflow", map[string]any{"route_sort_order": "999999999999999999999999"}, 1},
		{"Empty", map[string]any{"route_sort_order": ""}, 1},
		{"Null", map[string]any{"route_sort_order": nil}, 1},
		{"MissingColumn", map[string]any{}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)

			if err := checks.RouteSortOrderValid(ctx, config.Rule("routes_route_sort_order_valid")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "route_sort_order", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "route_sort_order", checks.RouteSortOrderValid, map[string]any{"route_sort_order": "invalid"})
}
