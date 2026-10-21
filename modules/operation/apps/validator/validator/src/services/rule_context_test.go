package services_test

import (
	"bytes"
	"database/sql"
	"encoding/json"
	ruleset "main/lib/rules"
	"main/services"
	"main/types"
	"main/validations/agency"
	"main/validations/feed_info"
	"path/filepath"
	"reflect"
	"testing"
)

func TestFlatRuleContextsReachAgencyChecks(t *testing.T) {
	config, err := services.ParseRulesFromFile("testdata/flat-agency-rules.json")
	if err != nil {
		t.Fatal(err)
	}
	if len(*config) != 17 {
		t.Fatalf("got %d rules, want 17", len(*config))
	}
	if got := config.Rule("agency_id_valid"); got.Options == nil || !reflect.DeepEqual(*got.Options, []string{"1"}) {
		t.Fatalf("options were not retained: %+v", got)
	}
	if got := config.Rule("agency_id_matched_with_agency_name"); got.Compare == nil || !reflect.DeepEqual(*got.Compare, []types.Compare{{Key: "1", Value: "test"}}) {
		t.Fatalf("comparison was not retained: %+v", got)
	}
	if config.Rule("agency_id_unique").Severity != types.SEVERITY_IGNORE {
		t.Fatal("omitted rule must be ignored")
	}
	encoded, err := json.Marshal(config)
	if err != nil {
		t.Fatal(err)
	}
	var roundTrip types.GtfsRules
	if err := json.Unmarshal(encoded, &roundTrip); err != nil {
		t.Fatal(err)
	}
	encodedAgain, err := json.Marshal(roundTrip)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(encoded, encodedAgain) {
		t.Fatal("flat configuration changed during JSON round trip")
	}

	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "agency.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	if _, err := db.Exec(`CREATE TABLE agency (
  agency_id TEXT, agency_name TEXT, agency_email TEXT, agency_fare_url TEXT,
  agency_phone TEXT, agency_url TEXT, agency_lang TEXT, agency_timezone TEXT
 );
 INSERT INTO agency VALUES
 ('1', 'test', 'invalid', 'https://example.com/fares', '+351210000000', 'https://example.com', 'pt', 'Europe/Lisbon'),
 ('2', 'wrong', 'help@example.com', 'https://example.com/fares', '+351210000000', 'https://example.com', 'pt', 'Europe/Lisbon'),
 ('', 'test', '', 'https://example.com/fares', '+351210000000', 'https://example.com', '', 'Europe/Lisbon');`); err != nil {
		t.Fatal(err)
	}
	ruleset.ConfigureMessageSeverities(config)
	services.AppMessageService.Clear()
	t.Cleanup(func() { ruleset.ConfigureMessageSeverities(nil); services.AppMessageService.Clear() })
	agency.RunValidations(*types.NewGtfsFromSQLite(db, ""), config)
	expected := map[string]types.Severity{
		"agency_id_field":    types.SEVERITY_ERROR,
		"agency_id_valid":    types.SEVERITY_ERROR,
		"agency_name_valid":  types.SEVERITY_ERROR,
		"agency_email_field": types.SEVERITY_WARNING,
		"agency_email_valid": types.SEVERITY_WARNING,
		"agency_lang_field":  types.SEVERITY_INFO,
	}
	summary := services.AppMessageService.GetSummary()
	if len(summary.Messages) != len(expected) {
		t.Fatalf("unexpected findings: %+v", summary)
	}
	for _, message := range summary.Messages {
		severity, exists := expected[message.RuleID]
		if !exists || message.Severity != severity || message.TotalRows != 1 {
			t.Fatalf("rule context or row dependency was not respected: %+v", message)
		}
	}
	for _, id := range []string{"agency_id_matched_with_agency_name", "agency_lang_valid", "agency_id_unique"} {
		if services.AppMessageService.RuleIssueCount(id) != 0 {
			t.Fatalf("blocked or omitted rule %s emitted findings", id)
		}
	}
}

func TestFlatFeedInfoFieldContextsMatchRunnerIDs(t *testing.T) {
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "feed-info.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	if _, err := db.Exec("CREATE TABLE feed_info (fixture TEXT); INSERT INTO feed_info VALUES ('')"); err != nil {
		t.Fatal(err)
	}
	config := types.GtfsRules{}
	fields := []string{"default_lang", "feed_lang", "feed_publisher_name", "feed_publisher_url", "feed_contact_email", "feed_contact_url", "feed_end_date", "feed_start_date", "feed_version"}
	for _, field := range fields {
		config.SetRule("feed_info_"+field+"_field", types.RuleContext{Severity: types.SEVERITY_WARNING})
	}
	config.SetRule("feed_info_feed_lang_valid", types.RuleContext{Severity: types.SEVERITY_ERROR, DependsOn: []string{"feed_info_feed_lang_field"}})
	ruleset.ConfigureMessageSeverities(&config)
	services.AppMessageService.Clear()
	t.Cleanup(func() { ruleset.ConfigureMessageSeverities(nil); services.AppMessageService.Clear() })
	feed_info.RunValidations(*types.NewGtfsFromSQLite(db, ""), &config)
	for _, field := range fields {
		id := "feed_info_" + field + "_field"
		if services.AppMessageService.RuleIssueCount(id) != 1 {
			t.Errorf("configured field rule %s did not run", id)
		}
	}
	summary := services.AppMessageService.GetSummary()
	if len(summary.Messages) != len(fields) || summary.TotalErrors != 0 || summary.TotalWarnings != len(fields) {
		t.Fatalf("unexpected feed_info findings or dependency execution: %+v", summary)
	}
}
