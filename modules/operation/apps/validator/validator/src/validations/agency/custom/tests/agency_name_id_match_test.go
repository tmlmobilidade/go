package agency_custom_test

import (
	"main/lib"
	"main/types"
	checks "main/validations/agency/custom/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyNameIdMatch(t *testing.T) {
	compare := []types.Compare{
		{Key: "AGENCY1", Value: "Metro Transit"},
		{Key: "AGENCY2", Value: "City Bus"},
		{Key: "AGENCY1", Value: "Metro Express"},
	}
	for _, tc := range []struct {
		name     string
		id       *string
		agency   *string
		severity types.Severity
		compare  *[]types.Compare
		issues   int
	}{
		{"match", lib.Ptr("AGENCY1"), lib.Ptr("Metro Transit"), types.SEVERITY_ERROR, &compare, 0},
		{"later match for same ID", lib.Ptr("AGENCY1"), lib.Ptr("Metro Express"), types.SEVERITY_ERROR, &compare, 0},
		{"wrong name", lib.Ptr("AGENCY1"), lib.Ptr("City Bus"), types.SEVERITY_ERROR, &compare, 1},
		{"unknown ID", lib.Ptr("UNKNOWN"), lib.Ptr("Metro Transit"), types.SEVERITY_ERROR, &compare, 1},
		{"mismatch warning", lib.Ptr("AGENCY1"), lib.Ptr("Wrong"), types.SEVERITY_WARNING, &compare, 1},
		{"mismatch info", lib.Ptr("AGENCY1"), lib.Ptr("Wrong"), types.SEVERITY_INFO, &compare, 1},
		{"mismatch ignored", lib.Ptr("AGENCY1"), lib.Ptr("Wrong"), types.SEVERITY_IGNORE, &compare, 0},
		{"mismatch forbidden skipped", lib.Ptr("AGENCY1"), lib.Ptr("Wrong"), types.SEVERITY_FORBIDDEN, &compare, 0},
		{"mismatch unconfigured", lib.Ptr("AGENCY1"), lib.Ptr("Wrong"), "", &compare, 0},
		{"no compare", lib.Ptr("AGENCY1"), lib.Ptr("Wrong"), types.SEVERITY_ERROR, nil, 0},
		{"empty compare", lib.Ptr("AGENCY1"), lib.Ptr("Metro Transit"), types.SEVERITY_ERROR, &[]types.Compare{}, 1},
		{"SQL NULL ID", nil, lib.Ptr("Metro Transit"), types.SEVERITY_ERROR, &compare, 0},
		{"SQL NULL name", lib.Ptr("AGENCY1"), nil, types.SEVERITY_ERROR, &compare, 0},
		{"empty ID", lib.Ptr(""), lib.Ptr("Metro Transit"), types.SEVERITY_ERROR, &compare, 0},
		{"empty name", lib.Ptr("AGENCY1"), lib.Ptr(""), types.SEVERITY_ERROR, &compare, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := &types.AgencyRules{AgencyNameIdMatch: types.RuleConfig{Severity: tc.severity, Compare: tc.compare}}
			testutils.ConfigureMessages(t, config)
			db := testutils.AgencyRow(t, 0, map[string]*string{"agency_id": tc.id, "agency_name": tc.agency})
			testutils.AssertAgencyRead(t, checks.AgencyNameIdMatch(db, config))
			testutils.AssertFindings(t, "agency_id_matched_with_agency_name", tc.severity, tc.issues)
		})
	}
}
