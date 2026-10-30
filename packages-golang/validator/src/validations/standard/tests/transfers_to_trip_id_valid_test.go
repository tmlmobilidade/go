package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
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
			config := validationutils.TransfersConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.TransfersFixture(t, tc.values, config)
			if err := standard.ToTripIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.TransfersAssertFindings(t, id, "to_trip_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.TransfersCheckInvalid(t, id, "to_trip_id", standard.ToTripIdForeign, map[string]any{"to_trip_id": "missing"})
}
