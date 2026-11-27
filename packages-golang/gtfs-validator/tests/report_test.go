package gtfsvalidator_test

import (
	"encoding/json"
	"fmt"
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
	for i := range services.MaxDetails + 1 {
		service.Add("rule", types.Finding{Severity: rules.SEVERITY_INFO, Rows: []int{i}, Message: fmt.Sprintf("Invalid name %d.", i)})
	}
	rows := make([]int, services.MaxDetails+1)
	for i := range rows {
		rows[i] = i
	}
	service.Add("rule", types.Finding{Severity: rules.SEVERITY_INFO, Rows: rows, Message: "Invalid name 0."})
	summary := service.Summary()
	result := summary.Results[0]
	if summary.Totals.Infos != 1 || result.TotalRows != services.MaxDetails+1 || len(result.Messages) != services.MaxDetails {
		t.Fatal(summary)
	}
	if got := result.Messages[0].Rows; len(got) != services.MaxDetails || got[0] != 2 || got[len(got)-1] != services.MaxDetails+1 {
		t.Fatalf("expected the first %d CSV lines, got %v", services.MaxDetails, got)
	}
	// Snapshots cannot mutate retained diagnostics.
	summary.Results[0].Messages[0].Rows[0] = 999
	if service.Summary().Results[0].Messages[0].Rows[0] != 2 {
		t.Fatal("snapshot aliases service rows")
	}
}

func TestReportGroupsRepeatedMessages(t *testing.T) {
	service := services.NewReport()
	translation := &types.Translation{Variant: "default", Values: map[string]string{"shape_id": "2002_0_1", "direction_id": "0", "suffix": "_0"}}
	finding := types.Finding{
		FileName:           "trips.txt",
		Severity:           rules.SEVERITY_WARNING,
		Message:            `Shape ID "2002_0_1" must end in "_0" for direction_id 0.`,
		MessageTranslation: translation,
		Rows:               []int{1},
	}
	service.Add("trip_shape_id_uses_direction_id", finding)
	finding.Rows = []int{0}
	finding.MessageTranslation = translation.Clone()
	service.Add("trip_shape_id_uses_direction_id", finding)
	finding.MessageTranslation.Variant = "other"
	service.Add("trip_shape_id_uses_direction_id", finding)

	result := service.Summary().Results[0]
	want := []types.Message{
		{Message: finding.Message, Rows: []int{2, 3}, Translation: translation},
		{Message: finding.Message, Rows: []int{2}, Translation: finding.MessageTranslation},
	}
	if !reflect.DeepEqual(result.Messages, want) || result.TotalRows != 2 {
		t.Fatalf("unexpected grouped result: %+v", result)
	}
}

func TestReportGroupsRowsAcrossFiles(t *testing.T) {
	service := services.NewReport()
	finding := types.Finding{FileName: "agency.txt", Field: "agency_id", Severity: rules.SEVERITY_WARNING, Rows: []int{0}, Message: "Invalid ID."}
	service.Add("rule", finding)
	finding.Field = "agency_name"
	service.Add("rule", finding)
	finding.FileName = "routes.txt"
	finding.Rows = []int{0, 2}
	finding.Severity = rules.SEVERITY_ERROR
	service.Add("rule", finding)

	summary := service.Summary()
	if len(summary.Results) != 1 || summary.Results[0].TotalRows != 3 || summary.Totals != (types.Totals{Errors: 1}) {
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
	summary := service.Summary()
	if summary.Totals != (types.Totals{Errors: 1}) {
		t.Fatal(summary.Totals)
	}
	result := summary.Results[0]
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
