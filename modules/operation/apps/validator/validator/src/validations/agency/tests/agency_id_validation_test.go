package agency

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/agency/validations"
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
		{"MissingColumn", []map[string]string{{"agency_name": "Agency"}}, 0, types.SEVERITY_ERROR, nil, 1},
		{"MissingRequired", []map[string]string{{"agency_id": ""}}, 0, types.SEVERITY_ERROR, nil, 1},
		{"MissingRecommended", []map[string]string{{"agency_id": ""}}, 0, types.SEVERITY_WARNING, nil, 1},
		{"ValidUnique", []map[string]string{{"agency_id": "001"}, {"agency_id": "002"}}, 1, types.SEVERITY_ERROR, nil, 0},
		{"Duplicate", []map[string]string{{"agency_id": "001"}, {"agency_id": "001"}}, 1, types.SEVERITY_ERROR, nil, 1},
		{"Allowed", []map[string]string{{"agency_id": "001"}}, 0, types.SEVERITY_ERROR, &[]string{"001"}, 0},
		{"NotAllowed", []map[string]string{{"agency_id": "002"}}, 0, types.SEVERITY_ERROR, &[]string{"001"}, 1},
		{"Wildcard", []map[string]string{{"agency_id": "002"}}, 0, types.SEVERITY_ERROR, &[]string{types.ALL_OPTIONS}, 0},
		{"ForbiddenPresent", []map[string]string{{"agency_id": "001"}}, 0, types.SEVERITY_FORBIDDEN, nil, 1},
		{"ForbiddenEmpty", []map[string]string{{"agency_id": ""}}, 0, types.SEVERITY_FORBIDDEN, nil, 0},
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
			assertAgencyRead(t, validations.AgencyIdValidation(table.At(tc.row), &types.AgencyRules{
				AgencyId: types.RuleConfig{Severity: tc.severity, Options: tc.options},
			}))
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
