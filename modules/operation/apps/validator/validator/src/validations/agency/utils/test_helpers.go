package agency_utils

import (
	"database/sql"
	"main/lib"
	"main/lib/rules"
	"main/services"
	dbops "main/services/database"
	"main/types"
	"path/filepath"
	"testing"
)

func AgencyRow(t *testing.T, index int, fields map[string]*string) *services.SQLiteContext {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "agency.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	headers := []string{"fixture"}
	for field := range fields {
		headers = append(headers, field)
	}
	if err := dbops.CreateTableIfNotExists(db, "agency", headers); err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec("INSERT INTO agency (rowid) VALUES (?)", index+1); err != nil {
		t.Fatal(err)
	}
	for field, value := range fields {
		if _, err := db.Exec("UPDATE agency SET "+dbops.SanitizeColumnName(field)+" = ? WHERE rowid = ?", value, index+1); err != nil {
			t.Fatal(err)
		}
	}
	table, err := services.NewSQLiteTable(db, "agency")
	if err != nil {
		t.Fatal(err)
	}
	return table.At(index).Context()
}

func AssertAgencyRead(t *testing.T, err error) {
	t.Helper()
	if err != nil {
		t.Fatal(err)
	}
}

// Check is the common signature of an agency row validation.
type Check func(*services.SQLiteContext, *types.AgencyRules) error

type Configure func(types.RuleConfig) *types.AgencyRules

// ConfigureMessages isolates the global message service and applies runtime severity settings.
func ConfigureMessages(t *testing.T, config *types.AgencyRules) {
	t.Helper()
	services.AppMessageService.Clear()
	rules.ConfigureMessageSeverities(&types.GtfsRules{Agency: *config})
	t.Cleanup(func() {
		rules.ConfigureMessageSeverities(nil)
		services.AppMessageService.Clear()
	})
}

func CheckPresence(t *testing.T, field string, check Check, configure Configure) {
	t.Helper()
	for _, tc := range []struct {
		name          string
		value         *string
		missingColumn bool
		severity      types.Severity
		issues        int
	}{
		{"missing column", nil, true, types.SEVERITY_ERROR, 1},
		{"SQL NULL", nil, false, types.SEVERITY_ERROR, 1},
		{"empty required", lib.Ptr(""), false, types.SEVERITY_ERROR, 1},
		{"empty recommended", lib.Ptr(""), false, types.SEVERITY_WARNING, 1},
		{"empty informational", lib.Ptr(""), false, types.SEVERITY_INFO, 1},
		{"missing column informational", nil, true, types.SEVERITY_INFO, 1},
		{"SQL NULL informational", nil, false, types.SEVERITY_INFO, 1},
		{"empty ignored", nil, false, types.SEVERITY_IGNORE, 0},
		{"empty unconfigured", nil, false, "", 0},
		{"present", lib.Ptr("value"), false, types.SEVERITY_ERROR, 0},
		{"present informational", lib.Ptr("value"), false, types.SEVERITY_INFO, 0},
		// Presence checks no longer reject a populated field with forbidden severity.
		{"present forbidden", lib.Ptr("value"), false, types.SEVERITY_FORBIDDEN, 0},
		{"empty forbidden", nil, false, types.SEVERITY_FORBIDDEN, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			values := map[string]*string{}
			if !tc.missingColumn {
				values[field] = tc.value
			}
			config := configure(types.RuleConfig{Severity: tc.severity})
			ConfigureMessages(t, config)
			AssertAgencyRead(t, check(AgencyRow(t, 0, values), config))
			AssertFindings(t, field+"_field", tc.severity, tc.issues)
		})
	}
}

func CheckOptions(t *testing.T, field, valid string, check Check, configure Configure) {
	t.Helper()
	for _, tc := range []struct {
		name     string
		value    *string
		severity types.Severity
		options  *[]string
		issues   int
	}{
		{"SQL NULL without options", nil, types.SEVERITY_ERROR, nil, 0},
		{"empty without options", lib.Ptr(""), types.SEVERITY_ERROR, nil, 0},
		{"valid", &valid, types.SEVERITY_ERROR, nil, 0},
		{"allowed", &valid, types.SEVERITY_ERROR, &[]string{valid}, 0},
		{"not allowed", &valid, types.SEVERITY_ERROR, &[]string{"other"}, 1},
		{"not allowed warning", &valid, types.SEVERITY_WARNING, &[]string{"other"}, 1},
		{"not allowed info", &valid, types.SEVERITY_INFO, &[]string{"other"}, 1},
		{"empty options", &valid, types.SEVERITY_ERROR, &[]string{}, 1},
		{"empty value not allowed", lib.Ptr(""), types.SEVERITY_ERROR, &[]string{valid}, 1},
		{"wildcard", &valid, types.SEVERITY_ERROR, &[]string{types.ALL_OPTIONS}, 0},
		{"ignored", &valid, types.SEVERITY_IGNORE, &[]string{"other"}, 0},
		{"unconfigured", &valid, "", &[]string{"other"}, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := configure(types.RuleConfig{Severity: tc.severity, Options: tc.options})
			ConfigureMessages(t, config)
			AssertAgencyRead(t, check(AgencyRow(t, 0, map[string]*string{field: tc.value}), config))
			AssertFindings(t, field+"_valid", tc.severity, tc.issues)
		})
	}
}

// CheckFormat tests format checks independently of their presence prerequisites.
// Empty timezones are accepted by time.LoadLocation; the field check handles presence.
func CheckFormat(t *testing.T, field, valid, invalid string, emptyValid bool, check Check, configure Configure) {
	t.Helper()
	emptyIssues := 1
	if emptyValid {
		emptyIssues = 0
	}
	for _, tc := range []struct {
		name     string
		value    *string
		severity types.Severity
		options  *[]string
		issues   int
	}{
		{"SQL NULL", nil, types.SEVERITY_ERROR, nil, emptyIssues},
		{"empty", lib.Ptr(""), types.SEVERITY_ERROR, nil, emptyIssues},
		{"valid", &valid, types.SEVERITY_ERROR, nil, 0},
		{"options do not restrict format", &valid, types.SEVERITY_ERROR, &[]string{"other"}, 0},
		{"invalid error", &invalid, types.SEVERITY_ERROR, nil, 1},
		{"invalid warning", &invalid, types.SEVERITY_WARNING, nil, 1},
		{"invalid info", &invalid, types.SEVERITY_INFO, nil, 1},
		{"invalid ignored", &invalid, types.SEVERITY_IGNORE, nil, 0},
		{"wildcard does not bypass format", &invalid, types.SEVERITY_ERROR, &[]string{types.ALL_OPTIONS}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := configure(types.RuleConfig{Severity: tc.severity, Options: tc.options})
			ConfigureMessages(t, config)
			AssertAgencyRead(t, check(AgencyRow(t, 0, map[string]*string{field: tc.value}), config))
			AssertFindings(t, field+"_valid", tc.severity, tc.issues)
		})
	}
}

// AssertFindings checks informational findings as well as error/warning totals.
func AssertFindings(t *testing.T, ruleID string, severity types.Severity, issues int) {
	t.Helper()
	errors, warnings := 0, 0
	if severity == types.SEVERITY_FORBIDDEN {
		severity = types.SEVERITY_ERROR
	}
	if severity == types.SEVERITY_ERROR {
		errors = issues
	}
	if severity == types.SEVERITY_WARNING {
		warnings = issues
	}
	summary := services.AppMessageService.GetSummary()
	if summary.TotalErrors != errors || summary.TotalWarnings != warnings || len(summary.Messages) != issues {
		t.Fatalf("want %d findings, %d errors and %d warnings: %+v", issues, errors, warnings, summary)
	}
	for _, group := range summary.Messages {
		if group.RuleID != ruleID || group.Severity != severity || group.FileName != "agency.txt" || group.TotalRows != 1 {
			t.Fatalf("expected one agency.txt row for %s with severity %s: %+v", ruleID, severity, group)
		}
	}
	if count := services.AppMessageService.RuleIssueCount(ruleID); count != uint64(issues) {
		t.Fatalf("rule issue count = %d, want %d", count, issues)
	}
}
