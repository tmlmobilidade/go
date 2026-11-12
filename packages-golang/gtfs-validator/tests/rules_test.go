package gtfsvalidator_test

import (
	"context"
	"reflect"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

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

	got, err := graph.Execute(context.Background(), nil, 2)
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
}
