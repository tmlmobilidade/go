package execution_test

import (
	"errors"
	"fmt"
	"slices"
	"testing"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	collector "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/messages/severity"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules/execution"
	graph "github.com/tmlmobilidade/go/packages-golang/validator/src/types/algorithm"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/validations"
)

func TestOperationalFailuresRetainLocationAndCannotBeSuppressed(t *testing.T) {
	severity.ConfigureMessageSeverities(map[string]rules.RuleConfig{
		"file_validation": {RuleContext: rules.RuleContext{Severity: rules.SEVERITY_IGNORE}},
	})
	t.Cleanup(func() { severity.ConfigureMessageSeverities(nil) })
	cause := errors.New("database read failed")
	for _, test := range []struct {
		name, file string
		rows       []int
		check      validationTypes.Check
	}{
		{"wrapped row failure", "trips.txt", []int{5}, func(*contextTypes.ValidationContext) error {
			return fmt.Errorf("read source: %w", &contextTypes.RowError{Table: "trips", Field: "shape_id", Row: 3, Err: cause})
		}},
		{"recovered panic", "shapes.txt", nil, func(*contextTypes.ValidationContext) error { panic("unexpected failure") }},
	} {
		t.Run(test.name, func(t *testing.T) {
			messages := collector.NewMessageService()
			state := &validationTypes.Execution{Messages: messages, Failures: make(map[string]error)}
			ctx := context.NewRuleContext("check", nil, rules.RuleContext{Severity: rules.SEVERITY_WARNING}, messages)
			ctx.FileName, ctx.Field = "shapes.txt", "shape_id"
			if status := execution.ExecuteRule(state, ctx, test.check); status != graph.Failed || !ctx.Failed || state.Err == nil {
				t.Fatalf("operational error did not fail the rule: %v, %v", status, state.Err)
			}
			findings := collector.AllMessages(messages.GetSummary())
			if len(findings) != 1 {
				t.Fatalf("got %d technical findings, want 1", len(findings))
			}
			m := findings[0]
			if m.RuleID != "file_validation" || m.Severity != rules.SEVERITY_ERROR || !m.SeverityResolved || m.FileName != test.file || m.Field != "shape_id" || !slices.Equal(m.Rows, test.rows) {
				t.Fatalf("technical finding lost severity or location: %+v", m)
			}
			if test.rows != nil && !errors.Is(state.Err, cause) {
				t.Fatalf("wrapped error lost its cause: %v", state.Err)
			}
		})
	}
}
