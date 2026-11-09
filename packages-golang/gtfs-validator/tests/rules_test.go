package gtfsvalidator_test

import (
	"context"
	"database/sql"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/dag"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
)

// A closed database exercises operational errors through the public entry point,
// without exposing private rule registration just to support tests.
func TestRulesOperationalError(t *testing.T) {
	database, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	if err := database.Close(); err != nil {
		t.Fatal(err)
	}

	report, err := rules.RunValidations(context.Background(), database, 2)
	if err == nil || report.Error == "" || len(report.Rules) != 3 {
		t.Fatal(report, err)
	}
	if report.Rules[0].Status != dag.Errored || report.Rules[1].Status != dag.Skipped || report.Rules[2].Status != dag.Skipped {
		t.Fatal(report)
	}
}

// A report is available before any database exists, including every built-in rule.
func TestPendingReport(t *testing.T) {
	report := rules.PendingReport()
	if len(report.Rules) != 3 {
		t.Fatal(report)
	}
	for i, result := range report.Rules {
		if result.Status != dag.Skipped || result.Reason == "" || result.Findings == nil {
			t.Fatal(result)
		}
		if i > 0 && report.Rules[i-1].ID >= result.ID {
			t.Fatal("rules are not sorted by ID")
		}
	}
}
