package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestRouteTextColorValid(t *testing.T) {
	const id = "routes_route_text_color_valid"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{{"Uppercase", map[string]any{"route_text_color": "AABBCC"}, 0},
		{"Lowercase", map[string]any{"route_text_color": "aabbcc"}, 0},
		{"Black", map[string]any{"route_text_color": "000000"}, 0},
		{"White", map[string]any{"route_text_color": "FFFFFF"}, 0},
		{"Short", map[string]any{"route_text_color": "ABC"}, 1},
		{"Hash", map[string]any{"route_text_color": "#AABBCC"}, 1},
		{"NonHex", map[string]any{"route_text_color": "GG0000"}, 1},
		{"TooLong", map[string]any{"route_text_color": "FFFFFF0"}, 1},
		{"Empty", map[string]any{"route_text_color": ""}, 1},
		{"Null", map[string]any{"route_text_color": nil}, 1},
		{"MissingColumn", map[string]any{}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := validationutils.RoutesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.RoutesFixture(t, tc.values, config)

			if err := standard.RouteTextColorValid(ctx, config.Rule("routes_route_text_color_valid")); err != nil {
				t.Fatal(err)
			}
			validationutils.RoutesAssertFindings(t, id, "route_text_color", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.RoutesCheckInvalid(t, id, "route_text_color", standard.RouteTextColorValid, map[string]any{"route_text_color": "invalid"})
}
