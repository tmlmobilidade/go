package agency_standard_test

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	agency_standard "main/validations/agency/standard/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyIdValidation(t *testing.T) {
	for _, tc := range []struct {
		name     string
		rows     []map[string]string
		row      int
		severity types.Severity
		options  *[]string
		issues   int
	}{
		{"ValidUnique", []map[string]string{{"agency_id": "001"}, {"agency_id": "002"}}, 1, types.SEVERITY_ERROR, nil, 0},
		{"Duplicate", []map[string]string{{"agency_id": "001"}, {"agency_id": "001"}}, 1, types.SEVERITY_ERROR, nil, 1},
		{"Allowed", []map[string]string{{"agency_id": "001"}}, 0, types.SEVERITY_ERROR, &[]string{"001"}, 0},
		{"NotAllowed", []map[string]string{{"agency_id": "002"}}, 0, types.SEVERITY_ERROR, &[]string{"001"}, 1},
		{"Wildcard", []map[string]string{{"agency_id": "002"}}, 0, types.SEVERITY_ERROR, &[]string{types.ALL_OPTIONS}, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			services.AppMessageService.Clear()
			gtfs, cleanup, err := (test_helpers.MockGtfs{TableData: map[string][]map[string]string{
				"agency": tc.rows,
				"routes": {{"agency_id": "001"}, {"agency_id": "001"}},
			}}).ToGtfsWithDB()
			if err != nil {
				t.Fatal(err)
			}
			defer cleanup()
			table, err := services.NewSQLiteTable(gtfs.DB(), "agency")
			if err != nil {
				t.Fatal(err)
			}
			config := &types.AgencyRules{
				AgencyIdValid:  types.RuleConfig{Severity: tc.severity, Options: tc.options},
				AgencyIdUnique: types.RuleConfig{Severity: tc.severity},
			}
			db := table.At(tc.row).Context()
			testutils.AssertAgencyRead(t, agency_standard.AgencyIdValid(db, config))
			testutils.AssertAgencyRead(t, agency_standard.AgencyIdUnique(db, config))
			messages := services.AppMessageService.GetSummary().Messages
			if len(messages) != tc.issues {
				t.Fatalf("got %d issues, want %d: %+v", len(messages), tc.issues, messages)
			}
			wantSeverity := tc.severity
			if wantSeverity == types.SEVERITY_FORBIDDEN {
				wantSeverity = types.SEVERITY_ERROR
			}
			if len(messages) > 0 && messages[0].Severity != wantSeverity {
				t.Fatalf("severity = %s, want %s", messages[0].Severity, wantSeverity)
			}
		})
	}
}
