package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestRouteUrlValid(t *testing.T) {
	const id = "routes_route_url_valid"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{{"HTTPS", map[string]any{"route_url": "https://example.org"}, 0},
		{"HTTP", map[string]any{"route_url": "http://example.org"}, 0},
		{"MissingScheme", map[string]any{"route_url": "example.org"}, 1},
		{"FTP", map[string]any{"route_url": "ftp://example.org"}, 1},
		{"MissingHost", map[string]any{"route_url": "https://"}, 1},
		{"BadEscape", map[string]any{"route_url": "https://example.org/%ZZ"}, 1},
		{"Empty", map[string]any{"route_url": ""}, 1},
		{"Null", map[string]any{"route_url": nil}, 1},
		{"MissingColumn", map[string]any{}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := validationutils.RoutesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.RoutesFixture(t, tc.values, config)

			if err := standard.RouteUrlValid(ctx, config.Rule("routes_route_url_valid")); err != nil {
				t.Fatal(err)
			}
			validationutils.RoutesAssertFindings(t, id, "route_url", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.RoutesCheckInvalid(t, id, "route_url", standard.RouteUrlValid, map[string]any{"route_url": "invalid"})
}
