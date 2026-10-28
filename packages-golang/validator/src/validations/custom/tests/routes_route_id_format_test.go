package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/custom/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
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
			config := validationutils.RoutesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.RoutesFixture(t, tc.values, config)

			if err := custom.RouteIdFormat(ctx, config.Rule("routes_route_id_format")); err != nil {
				t.Fatal(err)
			}
			validationutils.RoutesAssertFindings(t, id, "route_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.RoutesCheckInvalid(t, id, "route_id", custom.RouteIdFormat, map[string]any{"route_id": "other", "route_short_name": "100", "route_sort_order": "2"})
}
