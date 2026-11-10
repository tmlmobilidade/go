package testutil

import (
	"database/sql"
	"path/filepath"
	"reflect"
	"testing"

	context "github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/rules"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/validations"
	_ "modernc.org/sqlite"
)

type Collector struct{ Messages []messages.Message }

func (c *Collector) AddMessage(m messages.Message) { c.Messages = append(c.Messages, m) }

// Fixture uses imported GTFS semantics: TEXT columns, NULL cells and zero-based rows.
func Fixture(t *testing.T, pattern, shape any, missingColumn string) *sql.DB {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "gtfs.sqlite"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	db.SetMaxOpenConns(1)
	exec := func(query string, args ...any) {
		t.Helper()
		if _, err := db.Exec(query, args...); err != nil {
			t.Fatal(err)
		}
	}
	switch missingColumn {
	case "pattern_id":
		exec("CREATE TABLE trips (shape_id TEXT)")
		exec("INSERT INTO trips(rowid,shape_id) VALUES (2,?)", shape)
	case "shape_id":
		exec("CREATE TABLE trips (pattern_id TEXT)")
		exec("INSERT INTO trips(rowid,pattern_id) VALUES (2,?)", pattern)
	default:
		exec("CREATE TABLE trips (pattern_id TEXT, shape_id TEXT)")
		exec("INSERT INTO trips(rowid,pattern_id,shape_id) VALUES (2,?,?)", pattern, shape)
	}
	exec("CREATE TABLE shapes (shape_id TEXT)")
	exec("INSERT INTO shapes VALUES (?), (?)", "R1_0", "R1_0")
	return db
}
func AssertMessages(t *testing.T, c *Collector, id, field string, severity rules.Severities, count int) {
	t.Helper()
	if len(c.Messages) != count {
		t.Fatalf("got %d findings, want %d: %+v", len(c.Messages), count, c.Messages)
	}
	for _, m := range c.Messages {
		if m.RuleID != id || m.Field != field || m.FileName != "trips.txt" || m.Severity != severity || !reflect.DeepEqual(m.Rows, []int{1}) || !m.SeverityResolved || m.Message == "" {
			t.Errorf("unexpected finding: %+v", m)
		}
	}
}
func Presence(t *testing.T, field, id string, check validationTypes.Check) {
	t.Helper()
	for _, severity := range []rules.Severities{rules.SEVERITY_ERROR, rules.SEVERITY_WARNING, rules.SEVERITY_INFO, rules.SEVERITY_IGNORE} {
		for _, tc := range []struct {
			name    string
			value   any
			missing bool
			count   int
		}{
			{"present", "R1_0", false, 0}, {"empty", "", false, 1}, {"null", nil, false, 1}, {"missing_column", nil, true, 1},
		} {
			t.Run(string(severity)+"/"+tc.name, func(t *testing.T) {
				missing := ""
				if tc.missing {
					missing = field
				}
				db := Fixture(t, tc.value, tc.value, missing)
				c := &Collector{}
				if err := check(context.NewRuleContext(id, db, rules.RuleContext{Severity: severity}, c)); err != nil {
					t.Fatal(err)
				}
				count := tc.count
				if severity == rules.SEVERITY_IGNORE {
					count = 0
				}
				AssertMessages(t, c, id, field, severity, count)
			})
		}
	}
	QueryError(t, check)
}
func QueryError(t *testing.T, check validationTypes.Check) {
	t.Helper()
	t.Run("query_error", func(t *testing.T) {
		db := Fixture(t, "P1", "R1_0", "")
		if err := db.Close(); err != nil {
			t.Fatal(err)
		}
		c := &Collector{}
		if err := check(context.NewRuleContext("query_error", db, rules.RuleContext{Severity: rules.SEVERITY_ERROR}, c)); err == nil {
			t.Fatal("expected query error")
		}
		if len(c.Messages) != 0 {
			t.Fatal("query errors must not emit validation findings")
		}
	})
}
