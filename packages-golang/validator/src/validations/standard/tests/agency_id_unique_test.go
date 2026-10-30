package standard_test

import (
	"database/sql"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
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
	config := &types.GtfsRules{"agency_id_field": types.RuleContext{Severity: types.SEVERITY_INFO}, "agency_id_unique": types.RuleContext{Severity: types.SEVERITY_ERROR, DependsOn: []string{"agency_id_field"}}}
	rules.ConfigureMessageSeverities(config)
	services.AppMessageService.Clear()
	t.Cleanup(func() {
		rules.ConfigureMessageSeverities(nil)
		services.AppMessageService.Clear()
	})
	validations.RunAgencyValidations(*gtfs, config)
	summary := services.AppMessageService.GetSummary()
	if summary.TotalErrors != 0 || summary.TotalWarnings != 0 || len(summary.Messages) != 1 {
		t.Fatalf("uniqueness ran for missing IDs: %+v", summary)
	}
	message := summary.Messages[0]
	if message.RuleID != "agency_id_field" || message.Severity != types.SEVERITY_INFO || message.TotalRows != 2 {
		t.Fatalf("expected informational presence findings for both empty IDs: %+v", message)
	}
}

func TestAgencyAgencyIdUnique(t *testing.T) {
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
			sqliteDB, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "agency.db"))
			if err != nil {
				t.Fatal(err)
			}
			t.Cleanup(func() { sqliteDB.Close() })
			if _, err := sqliteDB.Exec("CREATE TABLE agency (agency_id TEXT)"); err != nil {
				t.Fatal(err)
			}
			for _, row := range tc.rows {
				if _, err := sqliteDB.Exec("INSERT INTO agency (agency_id) VALUES (?)", row["agency_id"]); err != nil {
					t.Fatal(err)
				}
			}
			table, err := services.NewSQLiteTable(sqliteDB, "agency")
			if err != nil {
				t.Fatal(err)
			}
			config := &types.GtfsRules{"agency_id_unique": types.RuleContext{Severity: tc.severity}}
			validationutils.ConfigureMessages(t, config)
			db := table.At(tc.row).Context()
			validationutils.AssertAgencyRead(t, standard.AgencyAgencyIdUnique(db, config.Rule("agency_id_unique")))
			validationutils.AgencyAssertFindings(t, "agency_id_unique", tc.severity, tc.issues)
		})
	}
}
