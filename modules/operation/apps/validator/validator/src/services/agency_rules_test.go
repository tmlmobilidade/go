package services

import (
	"main/lib"
	ruleset "main/lib/rules"
	"main/types"
	"os"
	"path/filepath"
	"testing"
)

func TestAgencyRulesParsePartialAndRejectInvalid(t *testing.T) {
	path := filepath.Join(t.TempDir(), "rules.json")
	for _, tc := range []struct {
		input string
		valid bool
	}{
		{`{}`, true},
		{`{"trips":{"_file":"warning"}}`, true},
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
	if context.Status() != ruleset.Passed || service.TotalErrors() != 0 || service.TotalWarnings() != 1 {
		t.Fatal("warning still failed dependency")
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
