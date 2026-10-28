package utils

import (
	"database/sql"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
	"main/types"
	"path/filepath"
	"reflect"
	"sort"
	"testing"
)

type Check func(*services.SQLiteContext, *types.RuleContext) error

type TestRow struct {
	ID     int
	Values map[string]any
}

// TestTable uses a file-backed database so nested SQLite reads share the fixture.
func TestTable(t *testing.T, rows ...TestRow) (*sql.DB, *services.SQLiteTable) {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "shapes.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	columns := map[string]bool{"fixture": true}
	for _, row := range rows {
		for key := range row.Values {
			columns[key] = true
		}
	}
	names := []string{}
	for key := range columns {
		names = append(names, key)
	}
	if err := dbops.CreateTableIfNotExists(db, "shapes", names); err != nil {
		t.Fatal(err)
	}
	for _, row := range rows {
		if _, err := db.Exec("INSERT INTO shapes (rowid) VALUES (?)", row.ID); err != nil {
			t.Fatal(err)
		}
		for field, value := range row.Values {
			if _, err := db.Exec("UPDATE shapes SET "+dbops.SanitizeColumnName(field)+"=? WHERE rowid=?", value, row.ID); err != nil {
				t.Fatal(err)
			}
		}
	}
	table, err := services.NewSQLiteTable(db, "shapes")
	if err != nil {
		t.Fatal(err)
	}
	return db, table
}

func TestRules(t *testing.T, id string, severity types.Severity) *types.GtfsRules {
	t.Helper()
	config := &types.GtfsRules{}
	config.SetRule(id, types.RuleContext{Severity: severity})
	rules.ConfigureMessageSeverities(config)
	services.AppMessageService.Clear()
	t.Cleanup(func() { rules.ConfigureMessageSeverities(nil); services.AppMessageService.Clear() })
	return config
}

func AssertShapeFindings(t *testing.T, id, field string, severity types.Severity, wantRows ...int) {
	t.Helper()
	if got := services.AppMessageService.RuleIssueCount(id); got != uint64(len(wantRows)) {
		t.Fatalf("%s: findings=%d want=%d", id, got, len(wantRows))
	}
	var rows []int
	for _, msg := range services.AppMessageService.GetSummary().AllMessages() {
		if msg.RuleID != id || msg.FileName != "shapes.txt" || msg.Field != field || msg.Severity != severity {
			t.Fatalf("unexpected finding: %+v", msg)
		}
		rows = append(rows, msg.Rows...)
	}
	sort.Ints(rows)
	sort.Ints(wantRows)
	if !reflect.DeepEqual(rows, wantRows) {
		t.Fatalf("rows=%v want=%v", rows, wantRows)
	}
	if severity == types.SEVERITY_INFO && (services.AppMessageService.TotalErrors() != 0 || services.AppMessageService.TotalWarnings() != 0) {
		t.Fatal("info affected error/warning totals")
	}
}

func CheckShapePresence(t *testing.T, field string, check Check) {
	t.Helper()
	id := "shapes_" + field + "_field"
	for _, tc := range []struct {
		name     string
		value    any
		missing  bool
		severity types.Severity
		want     bool
		nilRules bool
	}{
		{name: "MissingColumn", missing: true, severity: types.SEVERITY_ERROR, want: true},
		{name: "SQLNull", severity: types.SEVERITY_ERROR, want: true},
		{name: "Empty", value: "", severity: types.SEVERITY_ERROR, want: true},
		{name: "Warning", value: "", severity: types.SEVERITY_WARNING, want: true},
		{name: "Info", value: "", severity: types.SEVERITY_INFO, want: true},
		{name: "Ignore", value: "", severity: types.SEVERITY_IGNORE},
		{name: "Unconfigured", value: ""},
		{name: "NilRules", value: "", nilRules: true},
		{name: "Present", value: "value", severity: types.SEVERITY_ERROR},
		{name: "ZeroIsPresent", value: "0", severity: types.SEVERITY_ERROR},
	} {
		t.Run(tc.name, func(t *testing.T) {
			values := map[string]any{}
			if !tc.missing {
				values[field] = tc.value
			}
			db, table := TestTable(t, TestRow{ID: 7, Values: values})
			config := TestRules(t, id, tc.severity)
			if tc.nilRules {
				config = nil
			}
			if err := check(table.At(6).Context(), config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			var rows []int
			if tc.want {
				rows = []int{8}
			}
			AssertShapeFindings(t, id, field, tc.severity, rows...)
			db.Close()
			if err := check(table.At(6).Context(), config.Rule(id)); err == nil {
				t.Fatal("SQLite failure swallowed")
			}
		})
	}
}

func CheckShapeValues(t *testing.T, id, field string, check Check, valid, invalid []string) {
	t.Helper()
	for _, set := range []struct {
		values []string
		bad    bool
	}{{valid, false}, {invalid, true}} {
		for _, value := range set.values {
			t.Run("Value="+value, func(t *testing.T) {
				_, table := TestTable(t, TestRow{ID: 7, Values: map[string]any{field: value}})
				config := TestRules(t, id, types.SEVERITY_ERROR)
				if err := check(table.At(6).Context(), config.Rule(id)); err != nil {
					t.Fatal(err)
				}
				var rows []int
				if set.bad {
					rows = []int{8}
				}
				AssertShapeFindings(t, id, field, types.SEVERITY_ERROR, rows...)
			})
		}
	}
	for _, tc := range []struct {
		name                    string
		severity                types.Severity
		missing, null, nilRules bool
		want                    bool
	}{
		{name: "Warning", severity: types.SEVERITY_WARNING, want: true},
		{name: "Info", severity: types.SEVERITY_INFO, want: true},
		{name: "Ignore", severity: types.SEVERITY_IGNORE},
		{name: "Unconfigured"},
		{name: "NilRules", nilRules: true},
		{name: "MissingColumn", severity: types.SEVERITY_ERROR, missing: true, want: true},
		{name: "SQLNull", severity: types.SEVERITY_ERROR, null: true, want: true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			values := map[string]any{field: "bad"}
			if tc.missing {
				delete(values, field)
			} else if tc.null {
				values[field] = nil
			}
			db, table := TestTable(t, TestRow{ID: 7, Values: values})
			config := TestRules(t, id, tc.severity)
			if tc.nilRules {
				config = nil
			}
			if err := check(table.At(6).Context(), config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			var rows []int
			if tc.want {
				rows = []int{8}
			}
			AssertShapeFindings(t, id, field, tc.severity, rows...)
			db.Close()
			if err := check(table.At(6).Context(), config.Rule(id)); err == nil {
				t.Fatal("SQLite failure swallowed")
			}
		})
	}
}
