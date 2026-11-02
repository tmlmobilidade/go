package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
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
			config := validationutils.TripsConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.TripsFixture(t, map[string]any{"route_id": tc.value}, config)
			if err := standard.TripsRouteIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.TripsAssertFindings(t, id, "route_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.TripsCheckInvalid(t, id, "route_id", standard.TripsRouteIdForeign, map[string]any{"route_id": "missing"})
}
