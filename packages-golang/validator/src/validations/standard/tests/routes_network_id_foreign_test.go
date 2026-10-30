package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestNetworkIdForeign(t *testing.T) {
	const id = "routes_network_id_foreign"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{{"Exists", map[string]any{"network_id": "N1"}, 0},
		{"Missing", map[string]any{"network_id": "missing"}, 1},
		{"SQLValue", map[string]any{"network_id": "' OR 1=1 --"}, 1},
		{"Empty", map[string]any{"network_id": ""}, 1},
		{"Null", map[string]any{"network_id": nil}, 1},
		{"MissingColumn", map[string]any{}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := validationutils.RoutesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.RoutesFixture(t, tc.values, config)

			if err := standard.NetworkIdForeign(ctx, config.Rule("routes_network_id_foreign")); err != nil {
				t.Fatal(err)
			}
			validationutils.RoutesAssertFindings(t, id, "network_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.RoutesCheckInvalid(t, id, "network_id", standard.NetworkIdForeign, map[string]any{"network_id": "invalid"})
}
