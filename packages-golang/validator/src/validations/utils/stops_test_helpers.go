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

type StopsCheck func(*services.SQLiteContext, *types.RuleContext) error

// Fixture uses real SQLite reads and the same severity overrides as the runner.
// Tests using the global message service must not run in parallel.
func StopsFixture(t *testing.T, values map[string]any, config *types.GtfsRules, setup ...func(*sql.DB)) (*sql.DB, *services.SQLiteContext) {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "stops.db"))
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
	if _, err := db.Exec("CREATE TABLE stops (" + strings.Join(columns, ",") + "); INSERT INTO stops (rowid) VALUES (4)"); err != nil {
		t.Fatal(err)
	}
	for _, field := range fields {
		if _, err := db.Exec(fmt.Sprintf("UPDATE stops SET %q = ?", field), values[field]); err != nil {
			t.Fatal(err)
		}
	}
	for _, prepare := range setup {
		prepare(db)
	}
	tables, err := services.PrepareSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	table, err := tables.Table("stops")
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

func StopsConfig(id string, severity types.Severity) *types.GtfsRules {
	config := &types.GtfsRules{}
	config.SetRule(id, types.RuleContext{Severity: severity})
	return config
}

func StopsAssertFindings(t *testing.T, id, field string, severity types.Severity, count int) {
	t.Helper()
	if got := services.AppMessageService.RuleIssueCount(id); got != uint64(count) {
		t.Fatalf("%s: findings = %d, want %d; messages: %+v", id, got, count, services.AppMessageService.GetSummary().AllMessages())
	}
	if severity == types.SEVERITY_INFO {
		summary := services.AppMessageService.GetSummary()
		if summary.TotalErrors != 0 || summary.TotalWarnings != 0 {
			t.Fatal("informational findings changed error/warning totals")
		}
	}
	messages := services.AppMessageService.GetSummary().AllMessages()
	if count == 0 && len(messages) != 0 {
		t.Fatalf("unexpected findings: %+v", messages)
	}
	if severity == types.SEVERITY_FORBIDDEN {
		severity = types.SEVERITY_ERROR
	}
	for _, message := range messages {
		if message.RuleID != id || message.Field != field || message.FileName != "stops.txt" || message.Severity != severity || len(message.Rows) == 0 {
			t.Fatalf("unexpected finding: %+v", message)
		}
		for _, row := range message.Rows {
			if row != 5 {
				t.Fatalf("unexpected source row: %+v", message)
			}
		}
	}
}

// Case describes an observable result, including checks that return parse errors.
type StopsCase struct {
	Name           string
	Values         map[string]any
	Count          int
	WantError      bool
	Options        *[]string
	Setup          func(*sql.DB)
	ForbiddenCount *int
}

func StopsCheckCases(t *testing.T, id, field string, check StopsCheck, cases []StopsCase, setup ...func(*sql.DB)) {
	t.Helper()
	for _, tc := range cases {
		for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_INFO, types.SEVERITY_IGNORE, types.SEVERITY_FORBIDDEN} {
			t.Run(tc.Name+"/"+string(severity), func(t *testing.T) {
				config := StopsConfig(id, severity)
				rule := *config.Rule(id)
				rule.Options = tc.Options
				config.SetRule(id, rule)
				prepare := append([]func(*sql.DB){}, setup...)
				if tc.Setup != nil {
					prepare = append(prepare, tc.Setup)
				}
				_, db := StopsFixture(t, tc.Values, config, prepare...)
				err := check(db, config.Rule(id))
				if (err != nil) != tc.WantError {
					t.Fatalf("error = %v, want error %v", err, tc.WantError)
				}
				count := tc.Count
				if severity == types.SEVERITY_FORBIDDEN && tc.ForbiddenCount != nil {
					count = *tc.ForbiddenCount
				}
				if severity == types.SEVERITY_IGNORE {
					count = 0
				}
				StopsAssertFindings(t, id, field, severity, count)
			})
		}
	}
	for _, name := range []string{"NilContext", "MissingRule", "EmptySeverity"} {
		t.Run(name, func(t *testing.T) {
			_, db := StopsFixture(t, map[string]any{field: "0"}, nil, setup...)
			var rule *types.RuleContext
			if name == "MissingRule" {
				rule = (&types.GtfsRules{}).Rule(id)
			}
			if name == "EmptySeverity" {
				rule = &types.RuleContext{}
			}
			if err := check(db, rule); err != nil {
				t.Fatal(err)
			}
			StopsAssertFindings(t, id, field, types.SEVERITY_IGNORE, 0)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) {
		config := StopsConfig(id, types.SEVERITY_ERROR)
		connection, db := StopsFixture(t, map[string]any{field: "0"}, config, setup...)
		if err := connection.Close(); err != nil {
			t.Fatal(err)
		}
		if err := check(db, config.Rule(id)); err == nil {
			t.Fatal("SQLite error was swallowed")
		}
		StopsAssertFindings(t, id, field, types.SEVERITY_ERROR, 0)
	})
}

// CheckPresence also records whether an absent forbidden field is skipped or reported.
func StopsCheckPresence(t *testing.T, field string, check StopsCheck, forbiddenCount int) {
	t.Helper()
	StopsCheckCases(t, "stops_"+field+"_field", field, check, []StopsCase{
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1, ForbiddenCount: &forbiddenCount},
		{Name: "Null", Values: map[string]any{field: nil}, Count: 1, ForbiddenCount: &forbiddenCount},
		{Name: "Empty", Values: map[string]any{field: ""}, Count: 1, ForbiddenCount: &forbiddenCount},
		{Name: "Present", Values: map[string]any{field: "value"}},
		{Name: "Zero", Values: map[string]any{field: "0"}},
		{Name: "WhitespaceIsPresent", Values: map[string]any{field: " "}},
	})
}
