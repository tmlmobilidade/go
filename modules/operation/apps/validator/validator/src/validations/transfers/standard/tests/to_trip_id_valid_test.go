package transfers_standard_test

import (
	"main/types"
	checks "main/validations/transfers/standard/checks"
	testutils "main/validations/transfers/utils"
	"testing"
)

func TestToTripIdValid(t *testing.T) {
	const id = "transfers_to_trip_id_foreign"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{
		{"T1", map[string]any{"to_trip_id": "T1"}, 0},
		{"missing", map[string]any{"to_trip_id": "missing"}, 1},
		{"", map[string]any{"to_trip_id": ""}, 0},
		{"None", map[string]any{"to_trip_id": nil}, 0},
		{"' OR 1=1 --", map[string]any{"to_trip_id": "' OR 1=1 --"}, 1},
		{"routeR1", map[string]any{"to_trip_id": "T1", "to_route_id": "R1"}, 0},
		{"routeR2", map[string]any{"to_trip_id": "T1", "to_route_id": "R2"}, 1},
		{"route", map[string]any{"to_trip_id": "T1", "to_route_id": ""}, 0},
		{"EmptyTripRoute", map[string]any{"to_trip_id": "empty", "to_route_id": "R1"}, 0},
		{"FirstDuplicateWins", map[string]any{"to_trip_id": "duplicate", "to_route_id": "R1"}, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)
			if err := checks.ToTripIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "to_trip_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "to_trip_id", checks.ToTripIdForeign, map[string]any{"to_trip_id": "missing"})
}
