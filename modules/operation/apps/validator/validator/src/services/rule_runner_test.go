package services

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"main/lib/rules"
	"main/types"
	"os"
	"path/filepath"
	"testing"
)

func TestFileMissingPrerequisite(t *testing.T) {
	for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_IGNORE, ""} {
		for _, present := range []bool{false, true} {
			t.Run(fmt.Sprintf("severity=%s/present=%t", severity, present), func(t *testing.T) {
				config := types.GtfsRules{
					"agency_email_field": {Severity: types.SEVERITY_WARNING, DependsOn: []string{"agency_file_missing"}},
					"agency_email_valid": {Severity: types.SEVERITY_WARNING, DependsOn: []string{"agency_email_field"}},
				}
				if severity != "" {
					config["agency_file_missing"] = types.RuleContext{Severity: severity}
				}
				data, err := json.Marshal(config)
				if err != nil {
					t.Fatal(err)
				}
				path := filepath.Join(t.TempDir(), "rules.json")
				if err := os.WriteFile(path, data, 0600); err != nil {
					t.Fatal(err)
				}
				parsed, err := ParseRulesFromFile(path)
				if err != nil {
					t.Fatal(err)
				}
				db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "gtfs.db"))
				if err != nil {
					t.Fatal(err)
				}
				t.Cleanup(func() { db.Close() })
				if present {
					if _, err := db.Exec(`CREATE TABLE agency (agency_id TEXT); INSERT INTO agency VALUES ('1'), ('2')`); err != nil {
						t.Fatal(err)
					}
				}
				runner, err := NewRuleRunner(*types.NewGtfsFromSQLite(db, ""), parsed, "agency")
				if err != nil {
					t.Fatal(err)
				}
				calls := 0
				actions := RuleActions{
					"agency_email_field": func() { calls++ },
					"agency_email_valid": func() { calls++ },
				}
				statuses := runner.Run(actions, nil)
				wantFile, wantRule, wantCalls := rules.Failed, rules.Skipped, 0
				if present {
					wantFile, wantRule, wantCalls = rules.Passed, rules.Passed, 2
				}
				if statuses["agency_file_missing"] != wantFile || statuses["agency_email_field"] != wantRule || statuses["agency_email_valid"] != wantRule || calls != wantCalls {
					t.Fatalf("unexpected dependency outcomes: %v, calls=%d", statuses, calls)
				}
				if present {
					table, err := NewSQLiteTable(db, "agency")
					if err != nil {
						t.Fatal(err)
					}
					calls = 0
					if err := runner.RunTable(table, "agency", "agency_id", func(*SQLiteContext) RuleActions { return actions }, nil); err != nil {
						t.Fatal(err)
					}
					if calls != 4 {
						t.Fatalf("expected both checks on both rows, got %d calls", calls)
					}
				}
			})
		}
	}
}
