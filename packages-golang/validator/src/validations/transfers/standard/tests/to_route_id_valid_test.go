package transfers_standard_test

import (
	"main/types"
	checks "main/validations/transfers/standard/checks"
	testutils "main/validations/transfers/utils"
	"testing"
)

func TestToRouteIdValid(t *testing.T) {
	const id = "transfers_to_route_id_foreign"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{
		{"R1", map[string]any{"to_route_id": "R1"}, 0},
		{"missing", map[string]any{"to_route_id": "missing"}, 1},
		{"", map[string]any{"to_route_id": ""}, 0},
		{"None", map[string]any{"to_route_id": nil}, 0},
		{"' OR 1=1 --", map[string]any{"to_route_id": "' OR 1=1 --"}, 1},
		{"T1", map[string]any{"to_route_id": "R1", "to_trip_id": "T1"}, 0},
		{"T2", map[string]any{"to_route_id": "R1", "to_trip_id": "T2"}, 1},
		{"missing", map[string]any{"to_route_id": "R1", "to_trip_id": "missing"}, 0},
		{"empty", map[string]any{"to_route_id": "R1", "to_trip_id": "empty"}, 0},
		{"duplicate", map[string]any{"to_route_id": "R1", "to_trip_id": "duplicate"}, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)
			if err := checks.ToRouteIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "to_route_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "to_route_id", checks.ToRouteIdForeign, map[string]any{"to_route_id": "missing"})
}
