package lib

import (
	"main/i18n"
	"main/lib/rules"
	"main/types"
	"strings"
	"testing"
)

func TestValidationContextTranslatesUsingRuleID(t *testing.T) {
	original := i18n.AppTranslator
	defer func() { i18n.AppTranslator = original }()
	for _, language := range []string{"en", "pt"} {
		i18n.AppTranslator = i18n.NewTranslator(language)
		context := NewValidationContext("agency_id", "agency.txt", "agency_id_unique", 0, nil)
		message := context.GetTranslatedMessage("duplicate", "AGENCY-123")
		if !strings.Contains(message, "AGENCY-123") || strings.Contains(message, "%!") || strings.Contains(message, "agency_id_unique.") {
			t.Fatalf("%s: detail was not translated/formatted: %s", language, message)
		}
		context.WithSeverity(types.SEVERITY_ERROR)
		required := context.GetRequiredMessage("required", "recommended")
		context.WithSeverity(types.SEVERITY_WARNING)
		recommended := context.GetRequiredMessage("required", "recommended")
		if required == recommended || strings.Contains(required, "agency_id_unique.") || strings.Contains(recommended, "agency_id_unique.") {
			t.Fatalf("%s: required/recommended details were not resolved: %s / %s", language, required, recommended)
		}
		if generic := context.GetTranslatedMessage("generic"); generic == "agency_id_unique.generic" || generic == required {
			t.Fatalf("%s: generic summary was not resolved: %s", language, generic)
		}
	}
}

type capturedValidationMessages struct {
	messages []types.Message
}

func (c *capturedValidationMessages) AddMessage(message types.Message) {
	c.messages = append(c.messages, message)
}

func TestForbiddenContextEmitsErrorAndKeepsMessage(t *testing.T) {
	rules.ConfigureMessageSeverities(nil)
	collector := &capturedValidationMessages{}
	ctx := NewValidationContext("agency_id", "agency.txt", "agency_id_unique", 0, collector).WithSeverity(types.SEVERITY_FORBIDDEN)
	message := ctx.GetTranslatedMessage("forbidden")
	ctx.AddMessageWithSeverity(message)
	if !ctx.IsForbidden() || ctx.Status() != rules.Failed {
		t.Fatal("forbidden rule configuration or failed status was lost")
	}
	if len(collector.messages) != 1 || collector.messages[0].Severity != types.SEVERITY_ERROR || collector.messages[0].Message != message {
		t.Fatalf("unexpected output: %+v", collector.messages)
	}
}

func TestInfoContextPreservesMessageWithoutFailing(t *testing.T) {
	rules.ConfigureMessageSeverities(nil)
	collector := &capturedValidationMessages{}
	ctx := NewValidationContext("agency_id", "agency.txt", "agency_id_field", 0, collector).WithSeverity(types.SEVERITY_INFO)
	if ctx.ShouldSkip() {
		t.Fatal("info rule was skipped")
	}
	ctx.AddMessageWithSeverity("configured information")
	ctx.AddInfo("explicit information")
	if ctx.Status() != rules.Passed || len(collector.messages) != 2 {
		t.Fatalf("unexpected info outcome: %+v", collector.messages)
	}
	for _, message := range collector.messages {
		if message.Severity != types.SEVERITY_INFO {
			t.Fatal(message)
		}
	}
}
