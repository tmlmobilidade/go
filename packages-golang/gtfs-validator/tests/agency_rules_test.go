package gtfsvalidator_test

import (
	"slices"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

func TestAgencyFieldRequirements(t *testing.T) {
	const singleAgency = "CREATE TABLE agency (extra_column TEXT); INSERT INTO agency VALUES ('One');"
	const multipleAgencies = "CREATE TABLE agency (agency_id TEXT); INSERT INTO agency VALUES ('one'), (NULL), (' ');"
	for _, field := range []string{"name", "timezone", "url", "id", "fare_url", "lang", "phone"} {
		t.Run(field, func(t *testing.T) {
			required := field == "name" || field == "timezone" || field == "url"
			config := types.Rule{RuleID: "agency_" + field + "_field", Severity: types.SEVERITY_WARNING}
			var want [][]int
			if required {
				want = [][]int{nil}
			}
			checkAgencyRule(t, singleAgency, config, want)

			config.Severity = types.SEVERITY_ERROR
			checkAgencyRule(t, singleAgency, config, [][]int{nil})
		})
	}
	checkAgencyRule(t, multipleAgencies,
		types.Rule{RuleID: "agency_id_exists", Severity: types.SEVERITY_WARNING}, [][]int{{1, 2}})
	checkAgencyRule(t, "CREATE TABLE agency (agency_name TEXT); INSERT INTO agency VALUES ('One'), ('Two');",
		types.Rule{RuleID: "agency_id_exists", Severity: types.SEVERITY_WARNING}, [][]int{nil})
}

func TestAgencyFormatRules(t *testing.T) {
	for _, test := range []struct {
		field  string
		values string
		want   [][]int
	}{
		{"url", "('https://example.org/?sale=10%25#details'), ('/relative'), ('https://example.org/?sale=%XX')", [][]int{{1}, {2}}},
		{"fare_url", "('http://example.org/fares'), ('ftp://example.org/fares'), (NULL)", [][]int{{1}}},
		{"lang", "('pt-PT'), ('zh-Hant'), ('en_US'), ('??'), (' ')", [][]int{{2}, {3}}},
		{"phone", "('(+351) 21 123-4567'), ('503-238-RIDE'), ('information only'), ('21 call us')", [][]int{{2}, {3}}},
		{"timezone", "('Europe/Lisbon'), ('Local'), ('Europe/Madrid'), (NULL)", [][]int{{1}, {0, 2}}},
	} {
		t.Run(test.field, func(t *testing.T) {
			column := "agency_" + test.field
			setup := "CREATE TABLE agency (" + column + " TEXT); INSERT INTO agency VALUES " + test.values + ";"
			config := types.Rule{RuleID: column + "_valid", Severity: types.SEVERITY_WARNING}
			checkAgencyRule(t, setup, config, test.want)
		})
	}
}

func TestAgencyConfiguredValuesAndDuplicateIDs(t *testing.T) {
	const setup = `
		CREATE TABLE agency (agency_id TEXT, agency_name TEXT);
		INSERT INTO agency VALUES ('01', 'One'), ('01', 'Alias for One'), ('1', 'Another agency'), (NULL, 'No ID');
	`
	checkAgencyRule(t, setup, types.Rule{
		RuleID: "agency_id_unique", Severity: types.SEVERITY_ERROR,
	}, [][]int{{0, 1}})
	checkAgencyRule(t, setup, types.Rule{
		RuleID: "agency_id_valid", Severity: types.SEVERITY_WARNING, Options: []string{"01"},
	}, [][]int{{2}})
	checkAgencyRule(t, setup, types.Rule{
		RuleID: "agency_name_valid", Severity: types.SEVERITY_WARNING, Options: []string{"One", "Alias for One", "No ID"},
	}, [][]int{{2}})
	checkAgencyRule(t, setup, types.Rule{
		RuleID: "agency_name_valid", Severity: types.SEVERITY_WARNING, Options: []string{"all_options"},
	}, nil)
	checkAgencyRule(t, setup, types.Rule{
		RuleID: "agency_id_matched_with_agency_name", Severity: types.SEVERITY_WARNING,
		Compare: []types.RuleComparison{{Key: "01", Value: "One"}, {Key: "01", Value: "Alias for One"}, {Key: "", Value: "No ID"}},
	}, [][]int{{2}})
}

func TestAgencyForbiddenFile(t *testing.T) {
	config := types.Rule{RuleID: "agency_file_exists", Severity: types.SEVERITY_FORBIDDEN}
	checkAgencyRule(t, "CREATE TABLE routes (route_id TEXT);", config, nil)
	checkAgencyRule(t, "CREATE TABLE agency (agency_name TEXT);", config, [][]int{nil})
}

func checkAgencyRule(t *testing.T, setup string, config types.Rule, wantRows [][]int) {
	t.Helper()
	db := openSQLTestDatabase(t, setup)
	graph, err := rules.NewValidationGraph([]types.Rule{config})
	if err != nil {
		t.Fatal(err)
	}
	results, err := graph.Execute(t.Context(), db, 1)
	if err != nil {
		t.Fatal(err)
	}
	wantStatus := types.Passed
	if len(wantRows) > 0 {
		wantStatus = types.Failed
	}
	got := results[0]
	if got.Status != wantStatus || len(got.Value) != len(wantRows) {
		t.Fatalf("%s at %s yielded %+v, want status %s and findings for %v", config.RuleID, config.Severity, got, wantStatus, wantRows)
	}
	for i, finding := range got.Value {
		if finding.FileName != "agency.txt" || finding.Severity != config.Severity || !slices.Equal(finding.Rows, wantRows[i]) {
			t.Errorf("%s finding %+v, want agency.txt and severity %s at rows %v", config.RuleID, finding, config.Severity, wantRows[i])
		}
	}
}
