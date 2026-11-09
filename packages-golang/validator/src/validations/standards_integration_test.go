package validations_test

import (
	"database/sql"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	collector "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules/validate"
	graph "github.com/tmlmobilidade/go/packages-golang/validator/src/types/algorithm"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	_ "modernc.org/sqlite"
)

func TestConfiguredStandardCheckUsesFieldAndFileDependencies(t *testing.T) {
	for _, test := range []struct {
		name          string
		rows          []string
		createTable   bool
		fieldStatus   graph.Status
		standardState graph.Status
		findingRule   string
	}{
		{"invalid email", []string{"person@example.com", "invalid-email"}, true, graph.Passed, graph.Failed, "agency_email_valid"},
		{"missing value", []string{"", "invalid-email"}, true, graph.Failed, graph.Skipped, "agency_email_field"},
		{"valid email", []string{"person@example.com"}, true, graph.Passed, graph.Passed, ""},
		{"missing table", nil, false, graph.Skipped, graph.Skipped, ""},
	} {
		t.Run(test.name, func(t *testing.T) {
			db, err := sql.Open("sqlite", ":memory:")
			if err != nil {
				t.Fatal(err)
			}
			t.Cleanup(func() { db.Close() })
			db.SetMaxOpenConns(1)
			if test.createTable {
				if _, err := db.Exec("CREATE TABLE agency (agency_email TEXT)"); err != nil {
					t.Fatal(err)
				}
				for _, value := range test.rows {
					if _, err := db.Exec("INSERT INTO agency (agency_email) VALUES (?)", value); err != nil {
						t.Fatal(err)
					}
				}
			}
			path := filepath.Join(t.TempDir(), "rules.json")
			if err := os.WriteFile(path, []byte(`{"validation_rules":{
				"agency_email_field":{"severity":"error","depends_on":["agency_file_missing"]},
				"agency_email_valid":{"severity":"warning","depends_on":["agency_email_field"]}
			}}`), 0600); err != nil {
				t.Fatal(err)
			}
			configuration, err := validate.ValidateRulesJSON(path)
			if err != nil {
				t.Fatal(err)
			}
			result, err := validations.RunValidations(db, configuration, collector.NewMessageService())
			if err != nil {
				t.Fatal(err)
			}
			if result.Statuses["agency_email_field"] != test.fieldStatus || result.Statuses["agency_email_valid"] != test.standardState {
				t.Fatalf("unexpected dependency outcomes: %v", result.Statuses)
			}
			wantGate := graph.Failed
			if test.createTable {
				wantGate = graph.Passed
			}
			if result.Statuses["agency_file_missing"] != wantGate {
				t.Errorf("ignored file gate status = %v, want %v", result.Statuses["agency_file_missing"], wantGate)
			}
			findings := collector.AllMessages(result.Summary)
			if test.findingRule == "" {
				if len(findings) != 0 {
					t.Fatalf("unexpected findings: %+v", findings)
				}
				return
			}
			if len(findings) != 1 {
				t.Fatalf("got %d findings, want one: %+v", len(findings), findings)
			}
			finding := findings[0]
			wantRow, wantSeverity := 3, rules.SEVERITY_WARNING
			if test.findingRule == "agency_email_field" {
				wantRow, wantSeverity = 2, rules.SEVERITY_ERROR
			}
			if finding.RuleID != test.findingRule || finding.Field != "agency_email" || finding.FileName != "agency.txt" || finding.Severity != wantSeverity || !slices.Equal(finding.Rows, []int{wantRow}) {
				t.Errorf("finding lost configured identity, severity or source location: %+v", finding)
			}
			if finding.Message == "" || strings.Contains(finding.Message, "%!") || strings.HasPrefix(finding.Message, finding.RuleID+".") {
				t.Errorf("finding is not translated: %q", finding.Message)
			}
		})
	}
}

func TestRulesJSONAcceptsStandardIDsWithoutRenaming(t *testing.T) {
	path := filepath.Join(t.TempDir(), "rules.json")
	if err := os.WriteFile(path, []byte(`{
		"shape_pt_sequence_strictly_increasing":{"severity":"error","depends_on":["shapes_file_missing"]},
		"shape_dist_traveled_non_decreasing_with_sequence":{"severity":"warning"},
		"stop_times_continuous_pickup_valid_gtfs_enum":{"severity":"info"},
		"file_validation_gtfs_feed_file_presence_and_integrity_rule":{"severity":"error"}
	}`), 0600); err != nil {
		t.Fatal(err)
	}
	configuration, err := validate.ValidateRulesJSON(path)
	if err != nil {
		t.Fatal(err)
	}
	if len(configuration) != 4 {
		t.Fatalf("decoded %d standard rules, want four", len(configuration))
	}
}
