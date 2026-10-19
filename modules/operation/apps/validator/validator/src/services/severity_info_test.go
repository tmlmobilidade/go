package services_test

import (
	"encoding/json"
	"main/lib"
	"main/lib/rules"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	"os"
	"path/filepath"
	"slices"
	"testing"
)

func TestInfoSeverityConfiguration(t *testing.T) {
	config := rules.DefaultConfig()
	config.Agency.File = types.SEVERITY_INFO
	{
		ruleConfig := config.Agency.Rule("agency_id_field")
		ruleConfig.Severity = types.SEVERITY_INFO
		config.Agency.SetRule("agency_id_field", ruleConfig)
	}
	data, err := json.Marshal(config)
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(t.TempDir(), "rules.json")
	if err := os.WriteFile(path, data, 0600); err != nil {
		t.Fatal(err)
	}
	parsed, err := services.ParseRulesFromFile(path)
	if err != nil {
		t.Fatal(err)
	}
	parser := services.NewRulesParser(path)
	if parsed.Agency.Rule("agency_id_field").Severity != types.SEVERITY_INFO || !slices.Contains(parser.GetInfoFiles(parsed), "agency.txt") {
		t.Fatal("info severity was not retained")
	}
	if slices.Contains(parser.GetRequiredFiles(parsed), "agency.txt") || slices.Contains(parser.GetWarningFiles(parsed), "agency.txt") {
		t.Fatal("informational file treated as required or recommended")
	}
}

func TestInfoMessagesBlockDAGDependents(t *testing.T) {
	gtfs, cleanup, err := (test_helpers.MockGtfs{TableData: map[string][]map[string]string{
		"agency": {{"agency_id": "1"}},
	}}).ToGtfsWithDB()
	if err != nil {
		t.Fatal(err)
	}
	defer cleanup()
	config := &types.GtfsRules{Agency: types.AgencyRules{RuleSection: types.RuleSection{Rules: map[string]types.RuleConfig{"agency_id_field": types.RuleConfig{Severity: types.SEVERITY_INFO}, "agency_id_unique": types.RuleConfig{Severity: types.SEVERITY_ERROR, DependsOn: []string{"agency_id_field"}}}}}}
	rules.ConfigureMessageSeverities(config)
	services.AppMessageService.Clear()
	t.Cleanup(func() {
		rules.ConfigureMessageSeverities(nil)
		services.AppMessageService.Clear()
	})
	runner, err := services.NewRuleRunner(*gtfs, &config.Agency)
	if err != nil {
		t.Fatal(err)
	}
	for row := range 3 {
		ran := false
		statuses := runner.Run(services.RuleActions{
			"agency_id_field": func() {
				ctx := lib.NewValidationContext("agency_id", "agency.txt", "agency_id_field", row, services.AppMessageService)
				if row < 2 {
					ctx.AddError("informational finding")
					if ctx.Status() != rules.Failed {
						t.Fatal("info override did not fail the validation context")
					}
				}
			},
			"agency_id_unique": func() { ran = true },
		}, nil)
		if row < 2 {
			if ran || statuses["agency_id_field"] != rules.Failed || statuses["agency_id_unique"] != rules.Skipped {
				t.Fatalf("info did not block dependent rule: %v", statuses)
			}
		} else if !ran || statuses["agency_id_field"] != rules.Passed || statuses["agency_id_unique"] != rules.Passed {
			t.Fatalf("previous info finding leaked into a valid row: %v", statuses)
		}
	}
	summary := services.AppMessageService.GetSummary()
	if summary.TotalErrors != 0 || summary.TotalWarnings != 0 || services.AppMessageService.RuleIssueCount("agency_id_field") != 2 {
		t.Fatalf("incorrect info counts: %+v", summary)
	}
	if len(summary.Messages) != 1 || summary.Messages[0].Severity != types.SEVERITY_INFO || summary.Messages[0].TotalRows != 2 {
		t.Fatalf("info messages were lost: %+v", summary)
	}
	data, err := json.Marshal(summary)
	if err != nil {
		t.Fatal(err)
	}
	var decoded types.Summary
	if err := json.Unmarshal(data, &decoded); err != nil || decoded.Messages[0].Messages[0].Severity != types.SEVERITY_INFO {
		t.Fatalf("info did not survive JSON serialization: %s, %v", data, err)
	}
}

func TestInfoSeverityRanksBelowWarnings(t *testing.T) {
	rules.ConfigureMessageSeverities(nil)
	for _, severities := range [][]types.Severity{
		{types.SEVERITY_IGNORE, types.SEVERITY_INFO},
		{types.SEVERITY_INFO, types.SEVERITY_IGNORE},
		{types.SEVERITY_INFO, types.SEVERITY_WARNING},
		{types.SEVERITY_WARNING, types.SEVERITY_INFO},
	} {
		service := services.NewMessageService()
		want := types.SEVERITY_INFO
		for _, severity := range severities {
			service.AddMessage(types.Message{RuleID: "agency_id_field", Severity: severity, Message: string(severity)})
			if severity == types.SEVERITY_WARNING {
				want = severity
			}
		}
		if got := service.GetSummary().Messages[0].Severity; got != want {
			t.Fatalf("%v: summary severity = %s, want %s", severities, got, want)
		}
	}
}
