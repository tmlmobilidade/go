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
		message := types.Message{RuleID: "rule", FileName: "agency.txt", Severity: severity, Rows: []int{2, 0, 2}, Message: "Invalid name."}
		service.Add(message, "Invalid names.")
		message.Rows = []int{0, 2}
		message.SeverityResolved = true
		service.Add(message, "Invalid names.")
	}
	summary := service.Summary()
	if summary.TotalErrors != 2 || summary.TotalWarnings != 1 || len(summary.Messages) != 4 {
		t.Fatal(summary)
	}
	for _, group := range summary.Messages {
		if group.TotalRows != 2 || len(group.Messages) != 1 || !reflect.DeepEqual(group.Messages[0].Rows, []int{2, 4}) {
			t.Fatal(group)
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
	if len(fields) != 3 || fields["messages"] == nil || fields["total_errors"] == nil || fields["total_warnings"] == nil {
		t.Fatal(string(encoded))
	}
}

func TestReportDetailCap(t *testing.T) {
	service := services.NewReport()
	for i := 0; i < services.MaxDetails+1; i++ {
		service.Add(types.Message{RuleID: "rule", Severity: rules.SEVERITY_ERROR, Rows: []int{i}}, "Invalid names.")
	}
	summary := service.Summary()
	group := summary.Messages[0]
	if summary.TotalErrors != services.MaxDetails+1 || group.TotalRows != services.MaxDetails+1 || len(group.Messages) != services.MaxDetails {
		t.Fatal(summary)
	}
	// Snapshots cannot mutate retained diagnostics.
	summary.Messages[0].Messages[0].Rows[0] = 999
	if service.Summary().Messages[0].Messages[0].Rows[0] != 2 {
		t.Fatal("snapshot aliases service rows")
	}
}
