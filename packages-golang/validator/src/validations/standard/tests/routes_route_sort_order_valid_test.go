package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
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
			config := validationutils.RoutesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.RoutesFixture(t, tc.values, config)

			if err := standard.RouteSortOrderValid(ctx, config.Rule("routes_route_sort_order_valid")); err != nil {
				t.Fatal(err)
			}
			validationutils.RoutesAssertFindings(t, id, "route_sort_order", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.RoutesCheckInvalid(t, id, "route_sort_order", standard.RouteSortOrderValid, map[string]any{"route_sort_order": "invalid"})
}
