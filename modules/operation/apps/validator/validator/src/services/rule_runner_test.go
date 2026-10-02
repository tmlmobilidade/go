package services_test

import (
	"main/lib/rules"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	"sync"
	"testing"
)

func agencyRunner(t *testing.T, present bool) *services.RuleRunner {
	t.Helper()
	services.AppMessageService.Clear()
	rules.ConfigureMessageSeverities(nil)
	data := map[string][]map[string]string{}
	if present {
		data["agency"] = []map[string]string{{"agency_id": "1"}}
	}
	gtfs, cleanup, err := (test_helpers.MockGtfs{TableData: data}).ToGtfsWithDB()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(cleanup)
	var section *types.AgencyRules
	runner, err := services.NewRuleRunner(*gtfs, section)
	if err != nil {
		t.Fatal(err)
	}
	return runner
}

func TestRuleRunnerBlocksWarningsAndDeduplicatedErrorsPerRow(t *testing.T) {
	for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING} {
		t.Run(string(severity), func(t *testing.T) {
			runner := agencyRunner(t, true)
			for row := range 3 {
				matched, unrelated := false, false
				status := runner.Run(services.RuleActions{
					"agency_id_matched_with_agency_name": func() { matched = true },
					"agency_name_present":                func() {},
					"agency_id_unique": func() {
						if row < 2 {
							services.AppMessageService.AddMessage(types.Message{FileName: "agency.txt", RuleID: "agency_id_unique", Rows: []int{row}, Severity: severity, Message: "same issue"})
						}
					},
					"agency_url_valid_url": func() { unrelated = true },
				}, nil)
				if !unrelated {
					t.Fatal("unrelated check skipped")
				}
				if row < 2 && (matched || status["agency_id_unique"] != rules.Failed || status["agency_id_matched_with_agency_name"] != rules.Skipped) {
					t.Fatalf("row %d: %v", row, status)
				}
				if row == 2 && !matched {
					t.Fatal("earlier row failure leaked into good row")
				}
			}
		})
	}
}

func TestRuleRunnerMissingFileAndMissingImplementationNeverPass(t *testing.T) {
	for _, present := range []bool{false, true} {
		runner := agencyRunner(t, present)
		status := runner.Run(services.RuleActions{
			"agency_id_matched_with_agency_name": func() { t.Fatal("unavailable prerequisite passed") },
			"agency_name_present":                func() {},
		}, nil)
		if status["agency_id_matched_with_agency_name"] != rules.Skipped {
			t.Fatal(status)
		}
		if !present && status["agency_name_present"] != rules.Skipped {
			t.Fatal(status)
		}
	}
}

func TestRuleRunnerGroupsKeepIndependentPrerequisiteStatuses(t *testing.T) {
	runner := agencyRunner(t, true)
	good := runner.Run(services.RuleActions{"agency_id_unique": func() {}, "agency_name_present": func() {}}, nil)
	bad := services.MergeRuleStatuses(nil, good)
	bad["agency_id_unique"] = rules.Failed
	for _, tc := range []struct {
		seed map[string]rules.Status
		want bool
	}{{bad, false}, {good, true}} {
		ran := false
		runner.Run(services.RuleActions{"agency_id_matched_with_agency_name": func() { ran = true }}, tc.seed)
		if ran != tc.want {
			t.Fatalf("ran=%v, want=%v", ran, tc.want)
		}
	}
}

func TestConcurrentRuleIssueCounting(t *testing.T) {
	service := services.NewMessageService()
	var wg sync.WaitGroup
	for i := range 8 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for range 100 {
				service.AddMessage(types.Message{RuleID: "agency_id_unique", Rows: []int{i}, Severity: types.SEVERITY_WARNING, Message: "duplicate"})
				service.GetSummary()
			}
		}()
	}
	wg.Wait()
	if count := service.RuleIssueCount(rules.CatalogueEntry{ID: "agency_id_unique"}); count != 800 {
		t.Fatalf("count=%d", count)
	}
}
