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
	if _, err := rules.NewValidationGraph(configs); err != nil {
		t.Fatal(err)
	}
}

func TestConfiguredRulesAndDependencies(t *testing.T) {
	graph, err := rules.NewValidationGraph([]types.Rule{
		{RuleID: "agency_name_valid", Severity: types.SEVERITY_ERROR, DependsOn: []string{"AGENCY_EMAIL_VALID"}},
		{RuleID: "agency_name_field", Severity: types.SEVERITY_ERROR, DependsOn: []string{"agency_file_missing"}},
		{RuleID: "agency_file_missing", Severity: types.SEVERITY_IGNORE},
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
		{ID: "agency_file_missing", Status: types.Passed},
		{ID: "agency_name_field", Status: types.Passed},
		{ID: "agency_name_valid", Status: types.Skipped, Reason: "prerequisite unsuccessful", BlockedBy: []string{"agency_email_valid"}},
		{ID: "trips_trip_id_unique", Status: types.Passed},
	}
	if err != nil || !reflect.DeepEqual(got, want) {
		t.Fatalf("results = %+v, error = %v", got, err)
	}

	if _, err := db.ExecContext(t.Context(), "DROP TABLE agency"); err != nil {
		t.Fatal(err)
	}
	want[1] = types.Result[[]rules.Finding]{ID: "agency_file_missing", Status: types.Failed}
	want[2] = types.Result[[]rules.Finding]{
		ID: "agency_name_field", Status: types.Skipped, Reason: "prerequisite unsuccessful", BlockedBy: []string{"agency_file_missing"},
	}
	got, err = graph.Execute(t.Context(), db, 2)
	if err != nil || !reflect.DeepEqual(got, want) {
		t.Fatalf("results without agency = %+v, error = %v", got, err)
	}
}
