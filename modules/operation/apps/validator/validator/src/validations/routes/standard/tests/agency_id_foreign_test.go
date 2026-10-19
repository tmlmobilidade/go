package routes_standard_test

import (
	"main/types"
	checks "main/validations/routes/standard/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestAgencyIdUnique(t *testing.T) {
	const id = "routes_agency_id_unique"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{{"Exists", map[string]any{"agency_id": "A1"}, 0},
		{"Missing", map[string]any{"agency_id": "missing"}, 1},
		{"SQLValue", map[string]any{"agency_id": "' OR 1=1 --"}, 1},
		{"Empty", map[string]any{"agency_id": ""}, 1},
		{"Null", map[string]any{"agency_id": nil}, 1},
		{"MissingColumn", map[string]any{}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)

			if err := checks.AgencyIdUnique(ctx, config); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "agency_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "agency_id", checks.AgencyIdUnique, map[string]any{"agency_id": "invalid"})
}
