package standard_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	"main/types"
	"testing"
)

func TestFeedDAGBlocksDependentsAfterInformationalFinding(t *testing.T) {
	services.AppMessageService.Clear()
	t.Cleanup(services.AppMessageService.Clear)
	config := &types.GtfsRules{
		"shapes_file_missing":                        {Severity: types.SEVERITY_INFO},
		"trips_file_missing":                         {Severity: types.SEVERITY_FORBIDDEN},
		types.RuleIDGtfsFeedFilePresenceAndIntegrity: {Severity: types.SEVERITY_ERROR, DependsOn: []string{"shapes_file_missing"}},
	}
	gtfs, cleanup, err := createTestGtfs(types.Gtfs{Trip: []types.TripRaw{{TripId: "1"}}})
	if err != nil {
		t.Fatal(err)
	}
	defer cleanup()
	defer gtfs.Close()
	if validations.NewFileValidation().Validate(*gtfs, config) {
		t.Fatal("blocked integrity check emitted an error")
	}
	if services.AppMessageService.RuleIssueCount("shapes_file_missing") != 1 {
		t.Fatal("missing prerequisite finding")
	}
	if services.AppMessageService.RuleIssueCount(types.RuleIDGtfsFeedFilePresenceAndIntegrity) != 0 {
		t.Fatal("dependent integrity check ran")
	}
}

func TestFeedDAGMissingFileBlocksEvenWhenIgnored(t *testing.T) {
	services.AppMessageService.Clear()
	t.Cleanup(services.AppMessageService.Clear)
	config := &types.GtfsRules{
		"shapes_file_missing":                        {Severity: types.SEVERITY_IGNORE},
		"trips_file_missing":                         {Severity: types.SEVERITY_FORBIDDEN},
		types.RuleIDGtfsFeedFilePresenceAndIntegrity: {Severity: types.SEVERITY_ERROR, DependsOn: []string{"shapes_file_missing"}},
	}
	gtfs, cleanup, err := createTestGtfs(types.Gtfs{Trip: []types.TripRaw{{TripId: "1"}}})
	if err != nil {
		t.Fatal(err)
	}
	defer cleanup()
	defer gtfs.Close()
	if validations.NewFileValidation().Validate(*gtfs, config) {
		t.Fatal("absent file prerequisite did not block integrity check")
	}
	if len(services.AppMessageService.GetSummary().Messages) != 0 {
		t.Fatal("ignored presence or blocked integrity check emitted findings")
	}
}
