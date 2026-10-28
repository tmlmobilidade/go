package agency_custom_test

import (
	"database/sql"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	agency "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency"
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/custom/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/utils"
	"main/types"
	"path/filepath"
	"testing"
)

func TestAgencyNameIdMatch(t *testing.T) {
	compare := []types.Compare{
		{Key: "AGENCY1", Value: "Metro Transit"},
		{Key: "AGENCY2", Value: "City Bus"},
		{Key: "AGENCY1", Value: "Metro Express"},
	}
	for _, tc := range []struct {
		name     string
		id       *string
		agency   *string
		severity types.Severity
		compare  *[]types.Compare
		issues   int
	}{
		{"match", lib.Ptr("AGENCY1"), lib.Ptr("Metro Transit"), types.SEVERITY_ERROR, &compare, 0},
		{"later match for same ID", lib.Ptr("AGENCY1"), lib.Ptr("Metro Express"), types.SEVERITY_ERROR, &compare, 0},
		{"wrong name", lib.Ptr("AGENCY1"), lib.Ptr("City Bus"), types.SEVERITY_ERROR, &compare, 1},
		{"unknown ID", lib.Ptr("UNKNOWN"), lib.Ptr("Metro Transit"), types.SEVERITY_ERROR, &compare, 1},
		{"mismatch warning", lib.Ptr("AGENCY1"), lib.Ptr("Wrong"), types.SEVERITY_WARNING, &compare, 1},
		{"mismatch info", lib.Ptr("AGENCY1"), lib.Ptr("Wrong"), types.SEVERITY_INFO, &compare, 1},
		{"mismatch ignored", lib.Ptr("AGENCY1"), lib.Ptr("Wrong"), types.SEVERITY_IGNORE, &compare, 0},
		{"mismatch forbidden reports error", lib.Ptr("AGENCY1"), lib.Ptr("Wrong"), types.SEVERITY_FORBIDDEN, &compare, 1},
		{"mismatch unconfigured", lib.Ptr("AGENCY1"), lib.Ptr("Wrong"), "", &compare, 0},
		{"no compare", lib.Ptr("AGENCY1"), lib.Ptr("Wrong"), types.SEVERITY_ERROR, nil, 0},
		{"empty compare", lib.Ptr("AGENCY1"), lib.Ptr("Metro Transit"), types.SEVERITY_ERROR, &[]types.Compare{}, 1},
		{"SQL NULL ID", nil, lib.Ptr("Metro Transit"), types.SEVERITY_ERROR, &compare, 1},
		{"SQL NULL name", lib.Ptr("AGENCY1"), nil, types.SEVERITY_ERROR, &compare, 1},
		{"empty ID", lib.Ptr(""), lib.Ptr("Metro Transit"), types.SEVERITY_ERROR, &compare, 1},
		{"empty name", lib.Ptr("AGENCY1"), lib.Ptr(""), types.SEVERITY_ERROR, &compare, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := &types.GtfsRules{"agency_id_matched_with_agency_name": types.RuleContext{Severity: tc.severity, Compare: tc.compare}}
			testutils.ConfigureMessages(t, config)
			db := testutils.AgencyRow(t, 0, map[string]*string{"agency_id": tc.id, "agency_name": tc.agency})
			testutils.AssertAgencyRead(t, checks.AgencyNameIdMatch(db, config.Rule("agency_id_matched_with_agency_name")))
			testutils.AssertFindings(t, "agency_id_matched_with_agency_name", tc.severity, tc.issues)
		})
	}
}

func TestAgencyNameIdMatchDependsOnPresence(t *testing.T) {
	for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_INFO} {
		t.Run(string(severity), func(t *testing.T) {
			db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "agency.db"))
			if err != nil {
				t.Fatal(err)
			}
			t.Cleanup(func() { db.Close() })
			if _, err := db.Exec(`CREATE TABLE agency (agency_id TEXT, agency_name TEXT);
				INSERT INTO agency VALUES ('', 'Expected'), ('1', ''), ('1', 'Wrong'), ('1', 'Expected');`); err != nil {
				t.Fatal(err)
			}
			config := &types.GtfsRules{"agency_id_field": types.RuleContext{Severity: severity}, "agency_name_field": types.RuleContext{Severity: severity}, "agency_id_matched_with_agency_name": types.RuleContext{
				Severity:  types.SEVERITY_ERROR,
				DependsOn: []string{"agency_id_field", "agency_name_field"},
				Compare:   &[]types.Compare{{Key: "1", Value: "Expected"}},
			}}
			testutils.ConfigureMessages(t, config)
			agency.RunValidations(*types.NewGtfsFromSQLite(db, ""), config)
			summary := services.AppMessageService.GetSummary()
			errors, warnings := 1, 0
			if severity == types.SEVERITY_ERROR {
				errors += 2
			}
			if severity == types.SEVERITY_WARNING {
				warnings = 2
			}
			if summary.TotalErrors != errors || summary.TotalWarnings != warnings || len(summary.Messages) != 3 {
				t.Fatalf("expected two presence findings and one comparison error: %+v", summary)
			}
			for _, message := range summary.Messages {
				if message.RuleID != "agency_id_matched_with_agency_name" {
					continue
				}
				if message.Severity != types.SEVERITY_ERROR || message.TotalRows != 1 || len(message.Messages) != 1 || len(message.Messages[0].Rows) != 1 || message.Messages[0].Rows[0] != 4 {
					t.Fatalf("only the populated mismatching row should fail comparison: %+v", message)
				}
			}
			if count := services.AppMessageService.RuleIssueCount("agency_id_matched_with_agency_name"); count != 1 {
				t.Fatalf("comparison findings = %d, want 1", count)
			}
		})
	}
}
