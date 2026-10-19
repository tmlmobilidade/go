package routes_standard_test

import (
	"main/types"
	checks "main/validations/routes/standard/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestRouteUrlDifferentAgencyUrl(t *testing.T) {
	const id = "routes_route_url_different_agency_url"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{{"Different", map[string]any{"agency_id": "A1", "route_url": "https://routes.example"}, 0},
		{"Same", map[string]any{"agency_id": "A1", "route_url": "https://agency.example"}, 1},
		{"OtherAgencySameURL", map[string]any{"agency_id": "A1", "route_url": "https://other.example"}, 0},
		{"MissingAgency", map[string]any{"agency_id": "absent", "route_url": "https://agency.example"}, 0},
		{"Empty", map[string]any{"route_url": ""}, 0},
		{"Null", map[string]any{"route_url": nil}, 0},
		{"MissingColumn", map[string]any{}, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)

			if err := checks.RouteUrlDifferentAgencyUrl(ctx, config); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "route_url", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "route_url", checks.RouteUrlDifferentAgencyUrl, map[string]any{"agency_id": "A1", "route_url": "https://agency.example"})
}
