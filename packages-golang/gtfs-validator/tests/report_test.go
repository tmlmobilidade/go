package gtfsvalidator_test

import (
	"encoding/json"
	"reflect"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/services"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

func TestReportCollection(t *testing.T) {
	service := services.NewReport()
	for _, severity := range []rules.Severities{
		rules.SEVERITY_IGNORE, rules.SEVERITY_INFO, rules.SEVERITY_WARNING,
		rules.SEVERITY_ERROR, rules.SEVERITY_FORBIDDEN,
	} {
		ruleID := string(severity) + "_rule"
		finding := types.Finding{FileName: "agency.txt", Severity: severity, Rows: []int{2, 0, 2}, Message: "Invalid name.", Description: "Invalid names."}
		service.Add(ruleID, finding)
		finding.Rows = []int{0, 2}
		service.Add(ruleID, finding)
	}
	summary := service.Summary()
	if summary.Totals != (types.Totals{Errors: 2, Warnings: 1, Infos: 1}) || len(summary.Results) != 4 {
		t.Fatal(summary)
	}
	for _, result := range summary.Results {
		if result.TotalRows != 2 || result.Description != "Invalid names." || len(result.Messages) != 1 ||
			!reflect.DeepEqual(result.Messages[0], types.Message{Message: "Invalid name.", Rows: []int{2, 4}}) {
			t.Fatal(result)
		}
		if result.RuleID == "forbidden_rule" && result.Severity != types.SEVERITY_ERROR {
			t.Fatal(result)
		}
	}
	encoded, err := json.Marshal(summary)
	if err != nil {
		t.Fatal(err)
	}
	var fields map[string]json.RawMessage
	if err := json.Unmarshal(encoded, &fields); err != nil {
		t.Fatal(err)
	}
	if len(fields) != 2 || fields["results"] == nil || fields["totals"] == nil {
		t.Fatal(string(encoded))
	}
}

func TestReportDetailCap(t *testing.T) {
	service := services.NewReport()
	for i := 0; i < services.MaxDetails+1; i++ {
		service.Add("rule", types.Finding{Severity: rules.SEVERITY_INFO, Rows: []int{i}, Description: "Invalid names."})
	}
	summary := service.Summary()
	result := summary.Results[0]
	if summary.Totals.Infos != services.MaxDetails+1 || result.TotalRows != services.MaxDetails+1 || len(result.Messages) != services.MaxDetails {
		t.Fatal(summary)
	}
	// Snapshots cannot mutate retained diagnostics.
	summary.Results[0].Messages[0].Rows[0] = 999
	if service.Summary().Results[0].Messages[0].Rows[0] != 2 {
		t.Fatal("snapshot aliases service rows")
	}
}

func TestReportGroupsRowsAcrossFiles(t *testing.T) {
	service := services.NewReport()
	finding := types.Finding{FileName: "agency.txt", Field: "agency_id", Severity: rules.SEVERITY_ERROR, Rows: []int{0}, Message: "Invalid ID."}
	service.Add("rule", finding)
	finding.Field = "agency_name"
	service.Add("rule", finding)
	finding.FileName = "routes.txt"
	service.Add("rule", finding)

	summary := service.Summary()
	if len(summary.Results) != 1 || summary.Results[0].TotalRows != 2 || summary.Totals.Errors != 3 {
		t.Fatal(summary)
	}
}

func TestReportRetainsTranslationVariants(t *testing.T) {
	const setup = `
		CREATE TABLE agency (agency_timezone TEXT);
		INSERT INTO agency VALUES ('Europe/Lisbon'), ('Local'), ('Europe/Madrid');
	`
	graph, err := rules.NewValidationGraph([]types.Rule{{RuleID: "agency_timezone_valid", Severity: types.SEVERITY_ERROR}})
	if err != nil {
		t.Fatal(err)
	}
	results, err := graph.Execute(t.Context(), openSQLTestDatabase(t, setup), 1)
	if err != nil {
		t.Fatal(err)
	}
	service := services.NewReport()
	for _, finding := range results[0].Value {
		service.Add(results[0].ID, finding)
	}
	result := service.Summary().Results[0]
	if !reflect.DeepEqual(result.DescriptionTranslation, &types.Translation{Variant: "default"}) || len(result.Messages) != 2 {
		t.Fatal(result)
	}
	want := &types.Translation{Variant: "invalid_timezone", Values: map[string]string{"value": "Local"}}
	if !reflect.DeepEqual(result.Messages[0].Translation, want) ||
		!reflect.DeepEqual(result.Messages[1].Translation, &types.Translation{Variant: "inconsistent_timezones"}) {
		t.Fatal(result.Messages)
	}
	result.Messages[0].Translation.Values["value"] = "modified"
	if !reflect.DeepEqual(service.Summary().Results[0].Messages[0].Translation, want) {
		t.Fatal("snapshot aliases service translation values")
	}
}
