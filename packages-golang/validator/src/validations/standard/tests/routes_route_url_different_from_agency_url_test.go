package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestRouteUrlDifferentAgencyUrl(t *testing.T) {
	const id = "routes_route_url_different_from_agency_url"
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
			config := validationutils.RoutesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.RoutesFixture(t, tc.values, config)

			if err := standard.RouteUrlDifferentAgencyUrl(ctx, config.Rule("routes_route_url_different_from_agency_url")); err != nil {
				t.Fatal(err)
			}
			validationutils.RoutesAssertFindings(t, id, "route_url", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.RoutesCheckInvalid(t, id, "route_url", standard.RouteUrlDifferentAgencyUrl, map[string]any{"agency_id": "A1", "route_url": "https://agency.example"})
}
