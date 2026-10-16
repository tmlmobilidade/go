package services

import (
	"encoding/json"
	"main/lib"
	ruleset "main/lib/rules/rules"
	"main/types"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

func TestAgencyRulesRequireCompleteConfiguration(t *testing.T) {
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
		{`{}`, false},
		{`{"trips":{"_file":"warning"}}`, false},
		{`{"agency":{"agency_id_unique":{"severity":"error"}}}`, false},
		{`{"agency":{"agency_id":{"severity":"error"}}}`, false},
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
	grouped, err := json.Marshal(ruleset.DefaultConfig())
	if err != nil {
		t.Fatal(err)
	}
	var groups map[string]map[string]any
	if err := json.Unmarshal(grouped, &groups); err != nil {
		t.Fatal(err)
	}
	flat := map[string]any{}
	for group, entries := range groups {
		for id, value := range entries {
			if id == "_file" {
				if group == "file_validation" {
					continue
				}
				id = group + "_file_missing"
				value = map[string]any{"severity": value, "depends_on": []string{}}
			}
			flat[id] = value
		}
	}
	flat["agency_id_matched_with_agency_name"] = map[string]any{"severity": "error", "depends_on": []string{"agency_id_unique"}}
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
		if config.Agency.AgencyId.Severity != types.SEVERITY_WARNING || !slices.Contains(NewRulesParser(path).GetRequiredFiles(config), "agency.txt") {
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
	config.Trips.TripId.Severity = types.SEVERITY_WARNING
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
