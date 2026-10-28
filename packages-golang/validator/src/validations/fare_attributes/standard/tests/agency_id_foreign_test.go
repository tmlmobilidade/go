package fare_attributes_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_attributes/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_attributes/utils"
	"main/types"
	"testing"
)

func TestAgencyIdForeign(t *testing.T) {
	const id = "fare_attributes_agency_id_foreign"
	for _, tc := range []struct {
		name  string
		value any
		count int
	}{
		{"Valid", "A1", 0},
		{"Empty", "", 1},
		{"Null", nil, 1},
		{"MissingColumn", nil, 1},
		{"Invalid", "missing", 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			values := map[string]any{"agency_id": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "agency_id")
			}
			_, ctx := testutils.Fixture(t, values, config, "A1")

			if err := checks.AgencyIdForeign(ctx, config.Rule("fare_attributes_agency_id_foreign")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "agency_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "agency_id", checks.AgencyIdForeign, map[string]any{"agency_id": "missing"})
}
