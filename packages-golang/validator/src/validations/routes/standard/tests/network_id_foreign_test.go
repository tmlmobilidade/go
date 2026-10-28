package routes_standard_test

import (
	"main/types"
	checks "main/validations/routes/standard/checks"
	testutils "main/validations/routes/utils"
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
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)

			if err := checks.NetworkIdForeign(ctx, config.Rule("routes_network_id_foreign")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "network_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "network_id", checks.NetworkIdForeign, map[string]any{"network_id": "invalid"})
}
