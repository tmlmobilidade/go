package routes_utils

import (
	"database/sql"
	"fmt"
	ruleset "main/lib/rules"
	"main/services"
	"main/types"
	"path/filepath"
	"sort"
	"strings"
	"testing"
)

type Check func(*services.SQLiteContext, *types.RoutesRules) error

// Fixture uses real SQLite reads and the same severity overrides as the runner.
// Tests using the global message service must not run in parallel.
func Fixture(t *testing.T, values map[string]any, config *types.RoutesRules) (*sql.DB, *services.SQLiteContext) {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "routes.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	fields := make([]string, 0, len(values))
	for field := range values {
		fields = append(fields, field)
	}
	sort.Strings(fields)
	columns := []string{"fixture TEXT"}
	for _, field := range fields {
		columns = append(columns, fmt.Sprintf("%q TEXT", field))
	}
	if _, err := db.Exec("CREATE TABLE routes (" + strings.Join(columns, ",") + "); INSERT INTO routes (rowid) VALUES (4)"); err != nil {
		t.Fatal(err)
	}
	for _, field := range fields {
		if _, err := db.Exec(fmt.Sprintf("UPDATE routes SET %q = ?", field), values[field]); err != nil {
			t.Fatal(err)
		}
	}
	if _, err := db.Exec(`CREATE TABLE agency (agency_id TEXT, agency_url TEXT);
 INSERT INTO agency VALUES ('A1', 'https://agency.example'), ('A2', 'https://other.example');
 CREATE TABLE route_networks (network_id TEXT);
 INSERT INTO route_networks VALUES ('N1');`); err != nil {
		t.Fatal(err)
	}
	tables, err := services.PrepareSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	table, err := tables.Table("routes")
	if err != nil {
		t.Fatal(err)
	}
	services.AppMessageService.Clear()
	runtime := &types.GtfsRules{}
	if config != nil {
		runtime.Routes = *config
	}
	ruleset.ConfigureMessageSeverities(runtime)
	t.Cleanup(func() { ruleset.ConfigureMessageSeverities(nil); services.AppMessageService.Clear() })
	return db, table.At(3).Context()
}

func Config(id string, severity types.Severity) *types.RoutesRules {
	config := &types.RoutesRules{}
	config.SetRule(id, types.RuleConfig{Severity: severity})
	return config
}

func AssertFindings(t *testing.T, id, field string, severity types.Severity, count int) {
	t.Helper()
	if got := services.AppMessageService.RuleIssueCount(id); got != uint64(count) {
		t.Fatalf("%s: findings = %d, want %d; messages: %+v", id, got, count, services.AppMessageService.GetSummary().AllMessages())
	}
	messages := services.AppMessageService.GetSummary().AllMessages()
	if count == 0 && len(messages) != 0 {
		t.Fatalf("unexpected findings: %+v", messages)
	}
	if severity == types.SEVERITY_FORBIDDEN {
		severity = types.SEVERITY_ERROR
	}
	for _, message := range messages {
		if message.RuleID != id || message.Field != field || message.FileName != "routes.txt" || message.Severity != severity || len(message.Rows) == 0 {
			t.Fatalf("unexpected finding: %+v", message)
		}
		for _, row := range message.Rows {
			if row != 5 {
				t.Fatalf("unexpected source row: %+v", message)
			}
		}
	}
}

func AssertReadFailure(t *testing.T, check Check, id string) {
	t.Helper()
	config := Config(id, types.SEVERITY_ERROR)
	db, ctx := Fixture(t, map[string]any{"feed_start_date": "20260101", "feed_end_date": "20261231"}, config)
	if err := db.Close(); err != nil {
		t.Fatal(err)
	}
	if err := check(ctx, config); err == nil {
		t.Fatal("SQLite failure was swallowed")
	}
	AssertFindings(t, id, "", types.SEVERITY_ERROR, 0)
}
