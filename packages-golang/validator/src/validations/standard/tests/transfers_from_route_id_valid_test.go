package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestFromRouteIdValid(t *testing.T) {
	const id = "transfers_from_route_id_foreign"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{
		{"R1", map[string]any{"from_route_id": "R1"}, 0},
		{"missing", map[string]any{"from_route_id": "missing"}, 1},
		{"", map[string]any{"from_route_id": ""}, 0},
		{"None", map[string]any{"from_route_id": nil}, 0},
		{"' OR 1=1 --", map[string]any{"from_route_id": "' OR 1=1 --"}, 1},
		{"T1", map[string]any{"from_route_id": "R1", "from_trip_id": "T1"}, 0},
		{"T2", map[string]any{"from_route_id": "R1", "from_trip_id": "T2"}, 1},
		{"missing", map[string]any{"from_route_id": "R1", "from_trip_id": "missing"}, 0},
		{"empty", map[string]any{"from_route_id": "R1", "from_trip_id": "empty"}, 0},
		{"duplicate", map[string]any{"from_route_id": "R1", "from_trip_id": "duplicate"}, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := validationutils.TransfersConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.TransfersFixture(t, tc.values, config)
			if err := standard.FromRouteIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.TransfersAssertFindings(t, id, "from_route_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.TransfersCheckInvalid(t, id, "from_route_id", standard.FromRouteIdForeign, map[string]any{"from_route_id": "missing"})
}
