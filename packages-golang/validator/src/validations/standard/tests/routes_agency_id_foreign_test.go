package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestRoutesAgencyIdUnique(t *testing.T) {
	const id = "routes_agency_id_foreign"
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
			config := validationutils.RoutesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.RoutesFixture(t, tc.values, config)

			if err := standard.RoutesAgencyIdUnique(ctx, config.Rule("routes_agency_id_foreign")); err != nil {
				t.Fatal(err)
			}
			validationutils.RoutesAssertFindings(t, id, "agency_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.RoutesCheckInvalid(t, id, "agency_id", standard.RoutesAgencyIdUnique, map[string]any{"agency_id": "invalid"})
}
