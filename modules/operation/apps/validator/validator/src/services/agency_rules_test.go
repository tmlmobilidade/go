package services

import (
	"encoding/json"
	"main/lib"
	ruleset "main/lib/rules"
	"main/types"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

func TestAgencyRulesAcceptPartialConfiguration(t *testing.T) {
	path := filepath.Join(t.TempDir(), "rules.json")
	complete, err := json.Marshal(ruleset.DefaultConfig())
	if err != nil {
		t.Fatal(err)
	}
	for _, tc := range []struct {
		input string
		valid bool
	}{
		{string(complete), true},
		{`{}`, true},
		{`{"trips":{"_file":"warning"}}`, true},
		{`{"agency":{"agency_id_unique":{"severity":"error"}}}`, true},
		{`{"agency":{"agency_id":{"severity":"error"}}}`, true},
		{`{"trips":{"_file":""}}`, false},
		{`{"trips":{"trip_id_unique":{"severity":"invalid"}}}`, false},
	} {
		if err := os.WriteFile(path, []byte(tc.input), 0600); err != nil {
			t.Fatal(err)
		}
		_, err := ParseRulesFromFile(path)
		if (err == nil) != tc.valid {
			t.Fatalf("input %s: %v", tc.input, err)
		}
	}
}

func TestParseFlatAgencyRulesFromFile(t *testing.T) {
	flat := map[string]any{}
	flat["agency_id_matched_with_agency_name"] = map[string]any{"severity": "error", "depends_on": []string{"agency_id_unique"}}
	flat["agency_name_field"] = map[string]any{"severity": "info"}
	flat["agency_file_missing"] = map[string]any{"severity": "error"}
	flat["agency_id_unique"] = map[string]any{"severity": "warning", "depends_on": []string{"agency_file_present"}}
	path := filepath.Join(t.TempDir(), "rules.json")
	for _, wrapped := range []bool{false, true} {
		var input any = flat
		if wrapped {
			input = map[string]any{"validation_rules": flat}
		}
		data, err := json.Marshal(input)
		if err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(path, data, 0600); err != nil {
			t.Fatal(err)
		}
		config, err := ParseRulesFromFile(path)
		if err != nil {
			t.Fatal(err)
		}
		if config.Rule("agency_name_field").Severity != types.SEVERITY_INFO || config.Rule("agency_id_unique").Severity != types.SEVERITY_WARNING || !slices.Contains(NewRulesParser(path).GetRequiredFiles(config), "agency.txt") {
			t.Fatal("flat severities did not reach runtime rule and required-file settings")
		}
	}
	for name, dependencies := range map[string][]string{
		"unknown":       {"not_a_rule"},
		"cycle":         {"agency_id_matched_with_agency_name"},
		"another file":  {"trips_file_present"},
		"another group": {"trip_id_unique"},
	} {
		t.Run(name, func(t *testing.T) {
			flat["agency_id_unique"] = map[string]any{"severity": "warning", "depends_on": dependencies}
			data, err := json.Marshal(flat)
			if err != nil {
				t.Fatal(err)
			}
			if err := os.WriteFile(path, data, 0600); err != nil {
				t.Fatal(err)
			}
			if _, err := ParseRulesFromFile(path); err == nil || !strings.Contains(err.Error(), "Invalid depends_on") {
				t.Fatalf("invalid dependency accepted: %v", err)
			}
		})
	}
}

func TestAgencySeverityControlsMessagesAndDependencies(t *testing.T) {
	config := ruleset.DefaultConfig()
	{
		ruleConfig := config.Rule("trip_id_unique")
		ruleConfig.Severity = types.SEVERITY_WARNING
		config.SetRule("trip_id_unique", *ruleConfig)
	}
	ruleset.ConfigureMessageSeverities(&config)
	defer ruleset.ConfigureMessageSeverities(nil)
	service := NewMessageService()
	context := lib.NewValidationContext("trip_id", "trips.txt", "trip_id_unique", 0, service)
	context.AddError("bad trip")
	if context.Status() != ruleset.Failed || service.TotalErrors() != 0 || service.TotalWarnings() != 1 {
		t.Fatal("warning did not fail dependency")
	}
	service.AddMessage(types.Message{FileName: "shapes.txt", RuleID: "shape_id_required", Severity: types.SEVERITY_ERROR, Message: "shape id missing"})
	if len(service.GetSummary().Messages) != 1 {
		t.Fatal("ignored hardcoded error was emitted")
	}
	service.AddMessage(types.Message{FileName: "trips.txt", RuleID: "trips_values_parse", Severity: types.SEVERITY_ERROR, Message: "parse failed"})
	if service.TotalErrors() != 1 {
		t.Fatal("technical error was suppressed")
	}
}

func TestMessagesFromDifferentRulesAreNotMerged(t *testing.T) {
	service := NewMessageService()
	for _, file := range []string{"trips.txt", "shapes.txt"} {
		service.AddMessage(types.Message{FileName: file, RuleID: file + "_file_missing", Severity: types.SEVERITY_ERROR, Message: "required file"})
	}
	if service.TotalErrors() != 2 {
		t.Fatal("different file rules merged")
	}
}

func TestForbiddenMessagesAlwaysReportError(t *testing.T) {
	defer ruleset.ConfigureMessageSeverities(nil)
	for _, configured := range []bool{false, true} {
		ruleset.ConfigureMessageSeverities(nil)
		if configured {
			config := ruleset.DefaultConfig()
			{
				ruleConfig := config.Rule("agency_email_field")
				ruleConfig.Severity = types.SEVERITY_FORBIDDEN
				config.SetRule("agency_email_field", *ruleConfig)
			}
			ruleset.ConfigureMessageSeverities(&config)
		}
		service := NewMessageService()
		message := "agency_email is forbidden."
		service.AddMessage(types.Message{
			FileName: "agency.txt", Field: "agency_email", RuleID: "agency_email_field",
			Rows: []int{0}, Severity: types.SEVERITY_FORBIDDEN, Message: message,
		})
		summary := service.GetSummary()
		if summary.TotalErrors != 1 || summary.TotalWarnings != 0 || len(summary.Messages) != 1 {
			t.Fatalf("configured=%v: unexpected summary: %+v", configured, summary)
		}
		group := summary.Messages[0]
		if group.Severity != types.SEVERITY_ERROR || len(group.Messages) != 1 || group.Messages[0].Severity != types.SEVERITY_ERROR || group.Messages[0].Message != message {
			t.Fatalf("configured=%v: unexpected output: %+v", configured, group)
		}
		if service.RuleIssueCount("agency_email_field") != 1 {
			t.Fatal("forbidden error was not counted for dependency scheduling")
		}
	}
}
