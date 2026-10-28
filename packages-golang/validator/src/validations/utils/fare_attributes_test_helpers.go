package validationutils

import (
	"database/sql"
	"fmt"
	ruleset "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"path/filepath"
	"sort"
	"strings"
	"testing"
)

type FareAttributesCheck func(*services.SQLiteContext, *types.RuleContext) error

// Fixture uses real SQLite reads and the same severity overrides as the runner.
// Tests using the global message service must not run in parallel.
func FareAttributesFixture(t *testing.T, values map[string]any, config *types.GtfsRules, agencyIDs ...string) (*sql.DB, *services.SQLiteContext) {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "fare_attributes.db"))
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
	if _, err := db.Exec("CREATE TABLE fare_attributes (" + strings.Join(columns, ",") + "); INSERT INTO fare_attributes (rowid) VALUES (4)"); err != nil {
		t.Fatal(err)
	}
	for _, field := range fields {
		if _, err := db.Exec(fmt.Sprintf("UPDATE fare_attributes SET %q = ?", field), values[field]); err != nil {
			t.Fatal(err)
		}
	}
	if _, err := db.Exec("CREATE TABLE agency (agency_id TEXT)"); err != nil {
		t.Fatal(err)
	}
	for _, id := range agencyIDs {
		if _, err := db.Exec("INSERT INTO agency VALUES (?)", id); err != nil {
			t.Fatal(err)
		}
	}
	tables, err := services.PrepareSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	table, err := tables.Table("fare_attributes")
	if err != nil {
		t.Fatal(err)
	}
	services.AppMessageService.Clear()
	runtime := &types.GtfsRules{}
	if config != nil {
		*runtime = *config
	}
	ruleset.ConfigureMessageSeverities(runtime)
	t.Cleanup(func() { ruleset.ConfigureMessageSeverities(nil); services.AppMessageService.Clear() })
	return db, table.At(3).Context()
}

func FareAttributesConfig(id string, severity types.Severity) *types.GtfsRules {
	config := &types.GtfsRules{}
	config.SetRule(id, types.RuleContext{Severity: severity})
	return config
}

func FareAttributesAssertFindings(t *testing.T, id, field string, severity types.Severity, count int) {
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
		if message.RuleID != id || message.Field != field || message.FileName != "fare_attributes.txt" || message.Severity != severity || len(message.Rows) == 0 {
			t.Fatalf("unexpected finding: %+v", message)
		}
		for _, row := range message.Rows {
			if row != 5 {
				t.Fatalf("unexpected source row: %+v", message)
			}
		}
	}
}

func FareAttributesAssertReadFailure(t *testing.T, check FareAttributesCheck, id string) {
	t.Helper()
	config := FareAttributesConfig(id, types.SEVERITY_ERROR)
	db, ctx := FareAttributesFixture(t, map[string]any{"fare_id": "F1", "price": "1", "agency_id": "A1"}, config)
	if err := db.Close(); err != nil {
		t.Fatal(err)
	}
	if err := check(ctx, config.Rule(id)); err == nil {
		t.Fatal("SQLite failure was swallowed")
	}
	FareAttributesAssertFindings(t, id, "", types.SEVERITY_ERROR, 0)
}
