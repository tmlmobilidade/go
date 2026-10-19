package agency_standard_test

import (
	"database/sql"
	"main/lib/rules"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	agency "main/validations/agency"
	agency_standard "main/validations/agency/standard/checks"
	testutils "main/validations/agency/utils"
	"path/filepath"
	"testing"
)

func TestAgencyIdUniqueDependsOnInformationalPresence(t *testing.T) {
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "agency.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	if _, err := db.Exec(`CREATE TABLE agency (agency_id TEXT); INSERT INTO agency VALUES (''), (''), ('1');`); err != nil {
		t.Fatal(err)
	}
	gtfs := types.NewGtfsFromSQLite(db, "")
	config := &types.GtfsRules{Agency: types.AgencyRules{RuleSection: types.RuleSection{Rules: map[string]types.RuleConfig{"agency_id_field": types.RuleConfig{Severity: types.SEVERITY_INFO}, "agency_id_unique": types.RuleConfig{Severity: types.SEVERITY_ERROR, DependsOn: []string{"agency_id_field"}}}}}}
	rules.ConfigureMessageSeverities(config)
	services.AppMessageService.Clear()
	t.Cleanup(func() {
		rules.ConfigureMessageSeverities(nil)
		services.AppMessageService.Clear()
	})
	agency.RunValidations(*gtfs, config)
	summary := services.AppMessageService.GetSummary()
	if summary.TotalErrors != 0 || summary.TotalWarnings != 0 || len(summary.Messages) != 1 {
		t.Fatalf("uniqueness ran for missing IDs: %+v", summary)
	}
	message := summary.Messages[0]
	if message.RuleID != "agency_id_field" || message.Severity != types.SEVERITY_INFO || message.TotalRows != 2 {
		t.Fatalf("expected informational presence findings for both empty IDs: %+v", message)
	}
}

func TestAgencyIdUnique(t *testing.T) {
	for _, tc := range []struct {
		name     string
		rows     []map[string]string
		row      int
		severity types.Severity
		issues   int
	}{
		{"unique", []map[string]string{{"agency_id": "001"}, {"agency_id": "002"}}, 1, types.SEVERITY_ERROR, 0},
		{"duplicate error", []map[string]string{{"agency_id": "001"}, {"agency_id": "001"}}, 1, types.SEVERITY_ERROR, 1},
		{"duplicate warning", []map[string]string{{"agency_id": "001"}, {"agency_id": "001"}}, 1, types.SEVERITY_WARNING, 1},
		{"duplicate info", []map[string]string{{"agency_id": "001"}, {"agency_id": "001"}}, 1, types.SEVERITY_INFO, 1},
		{"duplicate ignored", []map[string]string{{"agency_id": "001"}, {"agency_id": "001"}}, 1, types.SEVERITY_IGNORE, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			gtfs, cleanup, err := (test_helpers.MockGtfs{TableData: map[string][]map[string]string{
				"agency": tc.rows,
			}}).ToGtfsWithDB()
			if err != nil {
				t.Fatal(err)
			}
			defer cleanup()
			table, err := services.NewSQLiteTable(gtfs.DB(), "agency")
			if err != nil {
				t.Fatal(err)
			}
			config := &types.AgencyRules{RuleSection: types.RuleSection{Rules: map[string]types.RuleConfig{"agency_id_unique": types.RuleConfig{Severity: tc.severity}}}}
			testutils.ConfigureMessages(t, config)
			db := table.At(tc.row).Context()
			testutils.AssertAgencyRead(t, agency_standard.AgencyIdUnique(db, config))
			testutils.AssertFindings(t, "agency_id_unique", tc.severity, tc.issues)
		})
	}
}
