package services

import (
	"encoding/json"
	"main/lib"
	ruleset "main/lib/rules/rules"
	"main/types"
	"os"
	"path/filepath"
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
