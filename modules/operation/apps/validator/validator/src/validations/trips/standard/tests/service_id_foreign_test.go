package trips_standard_test

import (
	"main/types"
	checks "main/validations/trips/standard/checks"
	testutils "main/validations/trips/utils"
	"testing"
)

func TestServiceIdForeign(t *testing.T) {
	const id = "trips_service_id_foreign"
	for _, tc := range []struct {
		value string
		count int
	}{{"S1", 0},
		{"S2", 0},
		{"", 0}, {"missing", 1}, {"' OR 1=1 --", 1}} {
		t.Run(tc.value, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"service_id": tc.value}, config)
			if err := checks.ServiceIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "service_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "service_id", checks.ServiceIdForeign, map[string]any{"service_id": "missing"})
}
