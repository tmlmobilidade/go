package algorithm_test

import (
	"reflect"
	"sync/atomic"
	"testing"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	collector "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules/algorithm"
	graph "github.com/tmlmobilidade/go/packages-golang/validator/src/types/algorithm"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/validations"
)

func TestManagerDefersChecksAndBlocksDependentsAfterDeduplicatedFindings(t *testing.T) {
	var findings, dependent, independent, unrelated atomic.Int32
	checks := validationTypes.RuleChecks{
		"finding": func(ctx *contextTypes.ValidationContext) error {
			findings.Add(1)
			context.AddMessage(ctx, "same finding")
			context.AddMessage(ctx, "same finding")
			return nil
		},
		"dependent":   func(*contextTypes.ValidationContext) error { dependent.Add(1); return nil },
		"independent": func(*contextTypes.ValidationContext) error { independent.Add(1); return nil },
		"unrelated":   func(*contextTypes.ValidationContext) error { unrelated.Add(1); return nil },
	}
	config := map[string]rules.RuleConfig{
		"finding":                  {RuleContext: rules.RuleContext{Severity: rules.SEVERITY_INFO}},
		"dependent":                {RuleContext: rules.RuleContext{Severity: rules.SEVERITY_ERROR}, DependsOn: []string{"finding"}},
		"independent":              {RuleContext: rules.RuleContext{Severity: rules.SEVERITY_ERROR}},
		"ignored_without_callback": {RuleContext: rules.RuleContext{Severity: rules.SEVERITY_IGNORE}},
	}
	messages := collector.NewMessageService()
	manager, err := algorithm.NewManager(nil, config, checks, messages)
	if err != nil {
		t.Fatal(err)
	}
	if findings.Load()+dependent.Load()+independent.Load()+unrelated.Load() != 0 {
		t.Fatal("building the manager executed a validation")
	}
	if len(checks) != 4 || len(manager.Rules) != 4 {
		t.Fatalf("registration map changed or unrelated rule selected: %d checks, %d nodes", len(checks), len(manager.Rules))
	}
	state := &validationTypes.Execution{Messages: messages, Failures: make(map[string]error)}
	statuses, err := algorithm.RunRules(manager, state)
	if err != nil || state.Err != nil {
		t.Fatalf("ordinary findings returned an operational failure: %v, %v", err, state.Err)
	}
	want := map[string]graph.Status{
		"finding": graph.Failed, "dependent": graph.Skipped,
		"independent": graph.Passed, "ignored_without_callback": graph.Skipped,
	}
	if !reflect.DeepEqual(statuses, want) {
		t.Fatalf("statuses = %v, want %v", statuses, want)
	}
	if findings.Load() != 1 || dependent.Load() != 0 || independent.Load() != 1 || unrelated.Load() != 0 {
		t.Fatal("selected callbacks did not follow dependency outcomes")
	}
	if got := len(collector.AllMessages(messages.GetSummary())); got != 1 {
		t.Fatalf("deduplicated diagnostics = %d, want 1", got)
	}
}

func TestManagerRejectsInvalidExecutionGraphs(t *testing.T) {
	check := func(*contextTypes.ValidationContext) error { t.Fatal("invalid graph executed a check"); return nil }
	for name, config := range map[string]map[string]rules.RuleConfig{
		"missing callback":     {"unknown": {RuleContext: rules.RuleContext{Severity: rules.SEVERITY_ERROR}}},
		"missing prerequisite": {"A": {DependsOn: []string{"missing"}}},
		"cycle":                {"A": {DependsOn: []string{"B"}}, "B": {DependsOn: []string{"A"}}},
	} {
		t.Run(name, func(t *testing.T) {
			_, err := algorithm.NewManager(nil, config, validationTypes.RuleChecks{"A": check, "B": check}, collector.NewMessageService())
			if err == nil {
				t.Fatal("invalid graph was accepted")
			}
		})
	}
}
