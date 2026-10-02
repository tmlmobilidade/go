package services_test

import (
	"main/i18n"
	"main/lib/rules"
	"main/services"
	"main/types"
	"testing"
)

// addMessage is a shorthand for the message shapes these tests group.
func addMessage(ruleID, field, fileName, message string, severity types.Severity, row int) types.Message {
	return types.Message{
		Rows:     []int{row},
		Field:    field,
		FileName: fileName,
		Message:  message,
		RuleID:   ruleID,
		Severity: severity,
	}
}

// TestSummaryGroupsMessagesByRule covers the shape the frontend reads: one entry per
// rule, carrying the rule's generic sentence and the messages it stands for.
func TestSummaryGroupsMessagesByRule(t *testing.T) {
	services.AppMessageService.Clear()
	rules.ConfigureMessageSeverities(nil)
	t.Cleanup(services.AppMessageService.Clear)

	services.AppMessageService.AddMessages([]types.Message{
		addMessage("agency_url_valid_url", "agency_url", "agency.txt", "first url is invalid", types.SEVERITY_WARNING, 1),
		addMessage("agency_url_valid_url", "agency_url", "agency.txt", "second url is invalid", types.SEVERITY_ERROR, 2),
		addMessage("agency_name_present", "agency_name", "agency.txt", "name is missing", types.SEVERITY_ERROR, 3),
	})

	summary := services.AppMessageService.GetSummary()

	if len(summary.Messages) != 2 {
		t.Fatalf("expected 2 rule groups, got %d", len(summary.Messages))
	}

	byRule := map[string]types.RuleMessage{}
	for _, rule := range summary.Messages {
		byRule[rule.RuleID] = rule
	}

	urlRule, found := byRule["agency_url_valid_url"]
	if !found {
		t.Fatalf("expected a group for agency_url_valid_url, got %+v", summary.Messages)
	}

	// Both messages of the rule land in the same group, errors and warnings together
	if len(urlRule.Messages) != 2 {
		t.Errorf("expected both messages in one array, got %d", len(urlRule.Messages))
	}

	// The group reports the most serious severity it contains, not the first one seen
	if urlRule.Severity != types.SEVERITY_ERROR {
		t.Errorf("expected the group to report error, got %q", urlRule.Severity)
	}

	if urlRule.TotalRows != 2 {
		t.Errorf("expected 2 distinct rows, got %d", urlRule.TotalRows)
	}

	if want := i18n.AppTranslator.Get("agency_url_valid_url.generic"); urlRule.Message != want {
		t.Errorf("expected the generic message %q, got %q", want, urlRule.Message)
	}

	// The flattener still exposes every individual message
	if all := summary.AllMessages(); len(all) != 3 {
		t.Errorf("expected 3 messages when flattened, got %d", len(all))
	}
}

// TestSummaryGenericMessageFallsBackToRuleID covers a rule whose generic sentence has
// not been translated yet: it must read as a description, never as a raw i18n key.
func TestSummaryGenericMessageFallsBackToRuleID(t *testing.T) {
	services.AppMessageService.Clear()
	rules.ConfigureMessageSeverities(nil)
	t.Cleanup(services.AppMessageService.Clear)

	services.AppMessageService.AddMessage(
		addMessage("rule_without_a_translation", "some_field", "some_file.txt", "detail", types.SEVERITY_ERROR, 1),
	)

	summary := services.AppMessageService.GetSummary()
	if len(summary.Messages) != 1 {
		t.Fatalf("expected 1 rule group, got %d", len(summary.Messages))
	}

	if got, want := summary.Messages[0].Message, "Rule without a translation"; got != want {
		t.Errorf("expected the humanised rule id %q, got %q", want, got)
	}
}

// TestEveryEmittedRuleHasAGenericMessage guards the i18n files: a rule the validator
// can emit but has no generic sentence for would silently fall back to its id.
func TestEveryEmittedRuleHasAGenericMessage(t *testing.T) {
	for _, entry := range rules.Catalogue() {
		ids := append([]string{entry.ID}, entry.OutputIDs...)
		for _, id := range ids {
			key := id + ".generic"
			if i18n.AppTranslator.Get(key) == key {
				t.Errorf("rule %q has no %q entry in the i18n files", id, key)
			}
		}
	}
}
