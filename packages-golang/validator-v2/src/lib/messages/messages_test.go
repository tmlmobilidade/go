package messages_test

import (
	"reflect"
	"sync"
	"testing"

	collector "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/messages/severity"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

func TestCollectorPreservesFieldsAndIndependentSnapshots(t *testing.T) {
	var service collector.MessageService
	rows := []int{0}
	for _, field := range []string{"shape_id", "pattern_id"} {
		service.AddMessage(messages.Message{
			FileName: "trips.txt", RuleID: "test_rule", Field: field,
			Message: "Required value", Rows: rows, Severity: rules.SEVERITY_ERROR,
		})
	}
	summary := service.GetSummary()
	findings := collector.AllMessages(summary)
	if summary.TotalErrors != 2 || len(findings) != 2 || summary.Messages[0].Field != "pattern_id, shape_id" {
		t.Fatalf("findings from different fields were merged: %+v", summary)
	}
	if !reflect.DeepEqual(rows, []int{0}) || !reflect.DeepEqual(findings[0].Rows, []int{2}) {
		t.Fatalf("input rows changed or CSV lines are incorrect: input=%v, output=%v", rows, findings[0].Rows)
	}
	findings[0].Rows[0] = 999
	if got := collector.AllMessages(service.GetSummary())[0].Rows; !reflect.DeepEqual(got, []int{2}) {
		t.Fatalf("caller changed stored rows through a report: %v", got)
	}
}

func TestCollectorCountsFindingsBeforeCappingAndDeduplicatingRows(t *testing.T) {
	service := collector.NewMessageService()
	for row := range 110 {
		service.AddMessage(messages.Message{
			FileName: "trips.txt", RuleID: "test_rule", Field: "shape_id",
			Message: "Required value", Rows: []int{row}, Severity: rules.SEVERITY_WARNING,
		})
	}
	summary := service.GetSummary()
	findings := collector.AllMessages(summary)
	if summary.TotalWarnings != 1 || len(findings) != 1 || service.RuleIssueCount("test_rule") != 110 {
		t.Fatalf("incorrect report/dependency counts: %+v", summary)
	}
	rows := findings[0].Rows
	if len(rows) != 100 || rows[0] != 2 || rows[98] != 100 || rows[99] != 111 {
		t.Fatalf("row sample lost its first 99 or latest occurrence: %v", rows)
	}
}

func TestCollectorHandlesConcurrentFindings(t *testing.T) {
	service := collector.NewMessageService()
	var workers sync.WaitGroup
	for range 128 {
		workers.Go(func() {
			service.AddMessage(messages.Message{RuleID: "test_rule", Message: "Repeated", Severity: rules.SEVERITY_WARNING})
			service.GetSummary()
		})
	}
	workers.Wait()
	if summary := service.GetSummary(); summary.TotalWarnings != 1 || service.RuleIssueCount("test_rule") != 128 {
		t.Fatalf("concurrent findings were lost: %+v", summary)
	}
}

func TestCollectorSeverityPolicy(t *testing.T) {
	t.Cleanup(func() { severity.ConfigureMessageSeverities(nil) })
	for _, tc := range []struct {
		name     string
		config   map[string]rules.RuleConfig
		id       string
		fallback rules.Severities
		resolved bool
		want     rules.Severities
	}{
		{name: "fallback", id: "test_rule", fallback: rules.SEVERITY_WARNING, want: rules.SEVERITY_WARNING},
		{name: "override", config: map[string]rules.RuleConfig{"test_rule": {RuleContext: rules.RuleContext{Severity: rules.SEVERITY_WARNING}}}, id: "test_rule", fallback: rules.SEVERITY_ERROR, want: rules.SEVERITY_WARNING},
		{name: "explicit", config: map[string]rules.RuleConfig{}, id: "test_rule", fallback: rules.SEVERITY_WARNING, resolved: true, want: rules.SEVERITY_WARNING},
		{name: "unconfigured", config: map[string]rules.RuleConfig{}, id: "test_rule", fallback: rules.SEVERITY_ERROR, want: rules.SEVERITY_IGNORE},
		{name: "technical", config: map[string]rules.RuleConfig{}, id: "file_validation", fallback: rules.SEVERITY_ERROR, want: rules.SEVERITY_ERROR},
		{name: "forbidden_fallback", id: "test_rule", fallback: rules.SEVERITY_FORBIDDEN, want: rules.SEVERITY_ERROR},
		{name: "forbidden_override", config: map[string]rules.RuleConfig{"test_rule": {RuleContext: rules.RuleContext{Severity: rules.SEVERITY_FORBIDDEN}}}, id: "test_rule", fallback: rules.SEVERITY_WARNING, want: rules.SEVERITY_ERROR},
	} {
		t.Run(tc.name, func(t *testing.T) {
			severity.ConfigureMessageSeverities(tc.config)
			service := collector.NewMessageService()
			service.AddMessage(messages.Message{RuleID: tc.id, Message: "Finding", Severity: tc.fallback, SeverityResolved: tc.resolved})
			findings := collector.AllMessages(service.GetSummary())
			if tc.want == rules.SEVERITY_IGNORE {
				if len(findings) != 0 || service.RuleIssueCount(tc.id) != 0 {
					t.Fatalf("ignored finding was collected: %+v", findings)
				}
			} else if len(findings) != 1 || findings[0].Severity != tc.want || service.RuleIssueCount(tc.id) != 1 {
				t.Fatalf("want %s, got %+v", tc.want, findings)
			}
		})
	}
}
