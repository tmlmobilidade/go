package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestFareAttributesAgencyIdField(t *testing.T) {
	validationutils.FareAttributesCheckPresence(t, "agency_id", fields.FareAttributesAgencyIdField)
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
			config := validationutils.FareAttributesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.FareAttributesFixture(t, values, config, ids...)
			if err := fields.FareAttributesAgencyIdField(ctx, config.Rule("fare_attributes_agency_id_field")); err != nil {
				t.Fatal(err)
			}
			validationutils.FareAttributesAssertFindings(t, id, "agency_id", types.SEVERITY_ERROR, tc.count)
		})
	}
}
