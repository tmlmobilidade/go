package gtfsvalidator_test

import (
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

func TestRuleFilesAreExecutable(t *testing.T) {
	paths, err := filepath.Glob(filepath.Join("..", "src", "rules", "file-validations", "*", "*.go"))
	if err != nil {
		t.Fatal(err)
	}
	var configs []types.Rule
	for _, path := range paths {
		name := filepath.Base(path)
		if name == "checks.go" || strings.HasSuffix(name, "_test.go") {
			continue
		}
		configs = append(configs, types.Rule{
			RuleID: strings.TrimSuffix(name, ".go"), Severity: types.SEVERITY_IGNORE,
		})
	}
	graph, err := rules.NewValidationGraph(configs)
	if err != nil {
		t.Fatal(err)
	}
	db := openSQLTestDatabase(t, "CREATE TABLE agency (agency_name TEXT);")
	results, err := graph.Execute(t.Context(), db, 2)
	if err != nil {
		t.Fatal(err)
	}
	for _, result := range results {
		if len(result.Value) != 0 {
			t.Errorf("rule file %s.go has no executable method: %+v", result.ID, result.Value)
		}
	}
}

func TestMissingRuleDoesNotAbortGraph(t *testing.T) {
	graph, err := rules.NewValidationGraph([]types.Rule{
		{RuleID: "test_rule", Severity: types.SEVERITY_ERROR},
		{RuleID: "agency_name_exists", Severity: types.SEVERITY_ERROR},
		{RuleID: "agency_name_valid", Severity: types.SEVERITY_ERROR, DependsOn: []string{"test_rule"}},
	})
	if err != nil {
		t.Fatal(err)
	}
	db := openSQLTestDatabase(t, "CREATE TABLE agency (agency_name TEXT); INSERT INTO agency VALUES ('');")
	results, err := graph.Execute(t.Context(), db, 2)
	if err != nil {
		t.Fatal(err)
	}
	if results[0].ID != "agency_name_exists" || results[0].Status != types.Failed || len(results[0].Value) != 1 {
		t.Fatalf("independent check did not execute: %+v", results[0])
	}
	if results[1].Status != types.Skipped || !reflect.DeepEqual(results[1].BlockedBy, []string{"test_rule"}) {
		t.Fatalf("dependent check ran without its prerequisite: %+v", results[1])
	}
	if results[2].ID != "test_rule" || results[2].Status != types.Failed || len(results[2].Value) != 1 || results[2].Value[0].Severity != types.SEVERITY_WARNING {
		t.Fatalf("missing check did not produce a warning: %+v", results[2])
	}
}

func TestConfiguredRulesAndDependencies(t *testing.T) {
	graph, err := rules.NewValidationGraph([]types.Rule{
		{RuleID: "agency_name_valid", Severity: types.SEVERITY_ERROR, DependsOn: []string{"AGENCY_EMAIL_VALID"}},
		{RuleID: "agency_name_exists", Severity: types.SEVERITY_ERROR, DependsOn: []string{"agency_file_exists"}},
		{RuleID: "agency_file_exists", Severity: types.SEVERITY_IGNORE},
		{RuleID: "AGENCY_EMAIL_VALID", Severity: "IGNORE"},
		{RuleID: "trips_trip_id_unique", Severity: types.SEVERITY_INFO},
	})
	if err != nil {
		t.Fatal(err)
	}

	db := openSQLTestDatabase(t, "CREATE TABLE agency (agency_name TEXT); INSERT INTO agency VALUES ('Example');")
	got, err := graph.Execute(t.Context(), db, 2)
	want := []types.Result[[]rules.Finding]{
		{ID: "agency_email_valid", Status: types.Skipped, Reason: "rule ignored", BlockedBy: []string{}},
		{ID: "agency_file_exists", Status: types.Passed},
		{ID: "agency_name_exists", Status: types.Passed},
		{ID: "agency_name_valid", Status: types.Skipped, Reason: "prerequisite unsuccessful", BlockedBy: []string{"agency_email_valid"}},
		{ID: "trips_trip_id_unique", Status: types.Passed},
	}
	if err != nil || !reflect.DeepEqual(got, want) {
		t.Fatalf("results = %+v, error = %v", got, err)
	}

	if _, err := db.ExecContext(t.Context(), "DROP TABLE agency"); err != nil {
		t.Fatal(err)
	}
	want[1] = types.Result[[]rules.Finding]{ID: "agency_file_exists", Status: types.Failed}
	want[2] = types.Result[[]rules.Finding]{
		ID: "agency_name_exists", Status: types.Skipped, Reason: "prerequisite unsuccessful", BlockedBy: []string{"agency_file_exists"},
	}
	got, err = graph.Execute(t.Context(), db, 2)
	if err != nil || !reflect.DeepEqual(got, want) {
		t.Fatalf("results without agency = %+v, error = %v", got, err)
	}
}
