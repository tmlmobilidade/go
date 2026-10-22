package trips_standard_test

import (
	"main/types"
	checks "main/validations/trips/standard/checks"
	testutils "main/validations/trips/utils"
	"testing"
)

func TestRouteIdForeign(t *testing.T) {
	const id = "trips_route_id_references_routes_table"
	for _, tc := range []struct {
		value string
		count int
	}{{"R1", 0},
		{"R2", 0},
		{"", 0}, {"missing", 1}, {"' OR 1=1 --", 1}} {
		t.Run(tc.value, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"route_id": tc.value}, config)
			if err := checks.RouteIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "route_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "route_id", checks.RouteIdForeign, map[string]any{"route_id": "missing"})
}
