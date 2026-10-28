package trips_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/utils"
	"main/types"
	"testing"
)

func TestRouteIdForeign(t *testing.T) {
	const id = "trips_route_id_foreign"
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
