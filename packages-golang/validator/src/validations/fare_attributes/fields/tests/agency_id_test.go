package fare_attributes_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_attributes/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_attributes/utils"
	"main/types"
	"testing"
)

func TestAgencyIdField(t *testing.T) {
	testutils.CheckPresence(t, "agency_id", checks.AgencyIdField)
	const id = "fare_attributes_agency_id_field"
	for _, tc := range []struct {
		name            string
		header          bool
		value           string
		agencies, count int
	}{
		{"MissingHeader", false, "", 2, 1},
		{"Empty", true, "", 2, 1},
		{"Present", true, "A1", 2, 0},
		{"SingleAgency", true, "", 1, 1},
		{"NoAgencies", true, "", 0, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			values := map[string]any{}
			if tc.header {
				values["agency_id"] = tc.value
			}
			ids := []string{"A1", "A2"}[:tc.agencies]
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, values, config, ids...)
			if err := checks.AgencyIdField(ctx, config.Rule("fare_attributes_agency_id_field")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "agency_id", types.SEVERITY_ERROR, tc.count)
		})
	}
}
