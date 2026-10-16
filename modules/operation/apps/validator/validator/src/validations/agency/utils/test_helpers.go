package agency_testutils

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

func CheckPresence(t *testing.T, field string, check Check, configure Configure) {
	t.Helper()
	for _, tc := range []struct {
		name          string
		value         *string
		missingColumn bool
		severity      types.Severity
		errors        int
		warnings      int
	}{
		{"missing column", nil, true, types.SEVERITY_ERROR, 1, 0},
		{"SQL NULL", nil, false, types.SEVERITY_ERROR, 1, 0},
		{"empty required", lib.Ptr(""), false, types.SEVERITY_ERROR, 1, 0},
		{"empty recommended", lib.Ptr(""), false, types.SEVERITY_WARNING, 0, 1},
		{"empty ignored", nil, false, types.SEVERITY_IGNORE, 0, 0},
		{"present", lib.Ptr("value"), false, types.SEVERITY_ERROR, 0, 0},
		{"present forbidden", lib.Ptr("value"), false, types.SEVERITY_FORBIDDEN, 1, 0},
		{"empty forbidden", nil, false, types.SEVERITY_FORBIDDEN, 0, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			services.AppMessageService.Clear()
			rules.ConfigureMessageSeverities(nil)
			t.Cleanup(services.AppMessageService.Clear)
			values := map[string]*string{}
			if !tc.missingColumn {
				values[field] = tc.value
			}
			config := configure(types.RuleConfig{Severity: tc.severity})
			AssertAgencyRead(t, check(AgencyRow(t, 0, values), config))
			assertIssues(t, field+"_field", tc.errors, tc.warnings)
		})
	}
}

func CheckValue(t *testing.T, field, valid, invalid string, check Check, configure Configure) {
	t.Helper()
	cases := []struct {
		name     string
		value    *string
		severity types.Severity
		options  *[]string
		errors   int
		warnings int
	}{
		{"missing", nil, types.SEVERITY_ERROR, nil, 0, 0},
		{"empty", lib.Ptr(""), types.SEVERITY_ERROR, nil, 0, 0},
		{"valid", &valid, types.SEVERITY_ERROR, nil, 0, 0},
		{"allowed", &valid, types.SEVERITY_ERROR, &[]string{valid}, 0, 0},
		{"not allowed", &valid, types.SEVERITY_ERROR, &[]string{"other"}, 1, 0},
		{"not allowed warning", &valid, types.SEVERITY_WARNING, &[]string{"other"}, 0, 1},
		{"wildcard", &valid, types.SEVERITY_ERROR, &[]string{types.ALL_OPTIONS}, 0, 0},
		{"ignored", &valid, types.SEVERITY_IGNORE, &[]string{"other"}, 0, 0},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			services.AppMessageService.Clear()
			rules.ConfigureMessageSeverities(nil)
			t.Cleanup(services.AppMessageService.Clear)
			config := configure(types.RuleConfig{Severity: tc.severity, Options: tc.options})
			AssertAgencyRead(t, check(AgencyRow(t, 0, map[string]*string{field: tc.value}), config))
			assertIssues(t, field+"_valid", tc.errors, tc.warnings)
		})
	}
	if invalid != "" {
		t.Run("invalid format", func(t *testing.T) {
			services.AppMessageService.Clear()
			rules.ConfigureMessageSeverities(nil)
			t.Cleanup(services.AppMessageService.Clear)
			config := configure(types.RuleConfig{Severity: types.SEVERITY_ERROR})
			AssertAgencyRead(t, check(AgencyRow(t, 0, map[string]*string{field: &invalid}), config))
			assertIssues(t, field+"_valid", 1, 0)
		})
	}
}

func assertIssues(t *testing.T, ruleID string, errors, warnings int) {
	t.Helper()
	summary := services.AppMessageService.GetSummary()
	if summary.TotalErrors != errors || summary.TotalWarnings != warnings {
		t.Fatalf("got %d errors and %d warnings, want %d and %d: %+v", summary.TotalErrors, summary.TotalWarnings, errors, warnings, summary.Messages)
	}
	for _, group := range summary.Messages {
		if group.RuleID != ruleID {
			t.Fatalf("rule ID = %s, want %s", group.RuleID, ruleID)
		}
	}
}
