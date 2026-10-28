package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestFareAttributesAgencyIdForeign(t *testing.T) {
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
			config := validationutils.FareAttributesConfig(id, types.SEVERITY_ERROR)
			values := map[string]any{"agency_id": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "agency_id")
			}
			_, ctx := validationutils.FareAttributesFixture(t, values, config, "A1")

			if err := standard.FareAttributesAgencyIdForeign(ctx, config.Rule("fare_attributes_agency_id_foreign")); err != nil {
				t.Fatal(err)
			}
			validationutils.FareAttributesAssertFindings(t, id, "agency_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.FareAttributesCheckInvalid(t, id, "agency_id", standard.FareAttributesAgencyIdForeign, map[string]any{"agency_id": "missing"})
}
