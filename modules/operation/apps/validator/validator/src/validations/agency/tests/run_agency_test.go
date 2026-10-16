package agency

import (
	"database/sql"
	ruleset "main/lib/rules"
	"main/services"
	"main/types"
	agencyrunner "main/validations/agency"
	"path/filepath"
	"reflect"
	"slices"
	"testing"
)

func TestAgencySQLiteRulesKeepDependenciesSeveritiesAndSourceRows(t *testing.T) {
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "feed.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	_, err = db.Exec(`CREATE TABLE agency (agency_id TEXT, agency_name TEXT);
		INSERT INTO agency VALUES ('dup', 'Right'), ('dup', 'Wrong'), ('unique', 'Wrong'), ('', '');`)
	if err != nil {
		t.Fatal(err)
	}
	config := &types.GtfsRules{Agency: types.AgencyRules{
		AgencyId:   types.RuleConfig{Severity: types.SEVERITY_WARNING, DependsOn: []string{"agency_file_present"}},
		AgencyName: types.RuleConfig{Severity: types.SEVERITY_ERROR, DependsOn: []string{"agency_file_present"}},
		AgencyNameIdMatch: types.RuleConfig{
			Severity:  types.SEVERITY_ERROR,
			DependsOn: []string{"agency_id_unique", "agency_name_present"},
			Compare:   &[]types.Compare{{Key: "dup", Value: "Right"}, {Key: "unique", Value: "Right"}},
		},
		AgencyUrl: types.RuleConfig{Severity: types.SEVERITY_ERROR, DependsOn: []string{"agency_file_present"}},
	}}
	services.AppMessageService.Clear()
	ruleset.ConfigureMessageSeverities(config)
	t.Cleanup(func() {
		services.AppMessageService.Clear()
		ruleset.ConfigureMessageSeverities(nil)
	})
	gtfs := types.NewGtfsFromSQLite(db, "")
	agencyrunner.RunValidations(*gtfs, config)
	expected := map[string][]int{
		"agency_id_unique":                   {2, 3, 5},
		"agency_name_present":                {5},
		"agency_id_matched_with_agency_name": {4},
		"agency_url_valid_url":               {2, 3, 4, 5},
	}
	for _, group := range services.AppMessageService.GetSummary().Messages {
		want, exists := expected[group.RuleID]
		if !exists {
			t.Fatalf("unexpected rule: %+v", group)
		}
		var rows []int
		for _, message := range group.Messages {
			rows = append(rows, message.Rows...)
		}
		slices.Sort(rows)
		if !reflect.DeepEqual(rows, want) {
			t.Fatalf("%s: rows = %v, want %v", group.RuleID, rows, want)
		}
		severity := types.SEVERITY_ERROR
		if group.RuleID == "agency_id_unique" {
			severity = types.SEVERITY_WARNING
		}
		if group.Severity != severity {
			t.Fatalf("%s: severity = %s, want %s", group.RuleID, group.Severity, severity)
		}
		delete(expected, group.RuleID)
	}
	if len(expected) != 0 {
		t.Fatalf("rules did not report issues: %v", expected)
	}
}
