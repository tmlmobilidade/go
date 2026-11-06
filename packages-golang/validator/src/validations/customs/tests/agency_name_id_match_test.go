package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/checks"
	"testing"
)

func TestAgencyNameIdMatch(t *testing.T) {
	checkCustom(t, customCheck{id: "agency_id_matched_with_agency_name", table: "agency", field: "agency_name_id_match", run: custom.AgencyNameIdMatch, skipForbidden: false, required: []string{}}, []customCase{
		{name: "valid", tables: map[string][]map[string]any{
			"agency": {
				{"agency_id": "A", "agency_name": "Agency"},
			},
		}, compare: [][2]string{{"A", "Agency"}}},
		{name: "invalid", tables: map[string][]map[string]any{
			"agency": {
				{"agency_id": "A", "agency_name": "Other"},
			},
		}, wantRows: []int{1}, compare: [][2]string{{"A", "Agency"}}},
	})
}
