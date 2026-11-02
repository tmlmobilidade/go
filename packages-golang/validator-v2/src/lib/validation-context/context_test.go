package validationcontext

import (
	"sync"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/i18n"
	algorithmtypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/algorithm/types"
	messageseverity "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/message-severity"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

type messageCollector struct {
	mu       sync.Mutex
	messages []messages.Message
}

func (collector *messageCollector) AddMessage(message messages.Message) {
	collector.mu.Lock()
	defer collector.mu.Unlock()
	collector.messages = append(collector.messages, message)
}

// TestConfiguredFindings preserves severity, source location, and dependency outcomes.
func TestConfiguredFindings(t *testing.T) {
	for _, severity := range []rules.Severities{rules.SEVERITY_IGNORE, rules.SEVERITY_INFO, rules.SEVERITY_WARNING, rules.SEVERITY_ERROR, rules.SEVERITY_FORBIDDEN} {
		t.Run(string(severity), func(t *testing.T) {
			collector := &messageCollector{}
			context := NewValidationContext("shape_id", "trips.txt", "shape_check", 7, collector, &rules.RuleContext{Severity: severity})
			if ShouldSkip(context) != (severity == rules.SEVERITY_IGNORE || severity == rules.SEVERITY_FORBIDDEN) {
				t.Fatal("unexpected skip decision")
			}
			AddError(context, "finding")
			if severity == rules.SEVERITY_IGNORE {
				if len(collector.messages) != 0 || Status(context) != algorithmtypes.Passed {
					t.Fatal("ignored finding changed the outcome")
				}
				return
			}
			if len(collector.messages) != 1 || Status(context) != algorithmtypes.Failed {
				t.Fatal("finding must emit one message and fail the prerequisite")
			}
			want := severity
			if want == rules.SEVERITY_FORBIDDEN {
				want = rules.SEVERITY_ERROR
			}
			message := collector.messages[0]
			if message.Severity != want || message.Field != "shape_id" || message.FileName != "trips.txt" || message.RuleID != "shape_check" || len(message.Rows) != 1 || message.Rows[0] != 7 || message.Message != "finding" {
				t.Fatalf("unexpected message: %+v", message)
			}
		})
	}
}

// TestDefaultAndExplicitContext distinguishes an omitted configuration from an explicit nil.
func TestDefaultAndExplicitContext(t *testing.T) {
	collector := &messageCollector{}
	context := NewValidationContext("", "", "check", 0, collector)
	if !ShouldIgnore(context) {
		t.Fatal("default severity must be ignore")
	}
	AddMessageWithSeverity(context, "ignored")
	AddWarning(context, "explicit warning")
	if len(collector.messages) != 1 || collector.messages[0].Severity != rules.SEVERITY_WARNING {
		t.Fatal("an omitted configuration must preserve explicit message severity")
	}
	context = NewValidationContext("", "", "check", 0, collector, nil)
	AddError(context, "ignored")
	if len(collector.messages) != 1 || Status(context) != algorithmtypes.Passed {
		t.Fatal("explicit nil configuration must suppress the default rule")
	}
	WithSeverity(context, rules.SEVERITY_INFO)
	WithSeverity(context, "")
	AddError(context, "configured info")
	AddWarning(context, "different rule", "another_check")
	if len(collector.messages) != 3 || collector.messages[1].Severity != rules.SEVERITY_INFO || collector.messages[2].Severity != rules.SEVERITY_WARNING || collector.messages[2].RuleID != "another_check" {
		t.Fatalf("unexpected overrides: %+v", collector.messages)
	}
}

// TestGlobalOverride verifies that message configuration takes precedence over context severity.
func TestGlobalOverride(t *testing.T) {
	messageseverity.ConfigureMessageSeverities(map[string]rules.RuleConfig{
		"check": {RuleContext: rules.RuleContext{Severity: rules.SEVERITY_WARNING}},
	})
	t.Cleanup(func() { messageseverity.ConfigureMessageSeverities(nil) })
	collector := &messageCollector{}
	context := NewValidationContext("", "", "check", 0, collector, &rules.RuleContext{Severity: rules.SEVERITY_ERROR})
	AddError(context, "warning")
	AddError(context, "omitted", "other_check")
	if len(collector.messages) != 1 || collector.messages[0].Severity != rules.SEVERITY_WARNING {
		t.Fatalf("unexpected globally configured messages: %+v", collector.messages)
	}
}

// TestTranslations checks rule namespaces, formatting, and severity-specific wording.
func TestTranslations(t *testing.T) {
	previous := i18n.AppTranslator
	i18n.AppTranslator = i18n.NewTranslator("en")
	t.Cleanup(func() { i18n.AppTranslator = previous })
	context := NewValidationContext("agency_email", "agency.txt", "agency_email_field", 0, nil)
	WithSeverity(context, rules.SEVERITY_ERROR)
	if got := GetRequiredMessage(context, "required", "recommended"); got != "The agency_email field is required" {
		t.Fatalf("required translation: %q", got)
	}
	WithSeverity(context, rules.SEVERITY_WARNING)
	if got := GetSeverityMessage(context, "required", "recommended", "informational"); got != "The agency_email field is recommended" {
		t.Fatalf("recommended translation: %q", got)
	}
	WithSeverity(context, rules.SEVERITY_INFO)
	if got := GetSeverityMessage(context, "required", "recommended", "unknown"); got != "agency_email_field.unknown" {
		t.Fatalf("fallback must retain the rule namespace: %q", got)
	}
	context.RuleID = "agency_email_valid"
	if got := GetTranslatedMessage(context, "invalid", "bad-email"); got != `Field "agency_email" "bad-email" is not a valid email address` {
		t.Fatalf("formatted translation: %q", got)
	}
}

// TestConcurrentChecks ensures separate contexts can report to a shared synchronized collector.
func TestConcurrentChecks(t *testing.T) {
	collector := &messageCollector{}
	var workers sync.WaitGroup
	for row := 0; row < 32; row++ {
		workers.Add(1)
		go func(row int) {
			defer workers.Done()
			context := NewValidationContext("id", "trips.txt", "check", row, collector)
			AddInfo(context, "finding")
			if Status(context) != algorithmtypes.Failed {
				t.Error("informational finding must fail its prerequisite")
			}
		}(row)
	}
	workers.Wait()
	if len(collector.messages) != 32 {
		t.Fatalf("received %d messages, want 32", len(collector.messages))
	}
}
