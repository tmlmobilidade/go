package standard_test

import (
	"database/sql"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/validations"
	testutil "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	_ "modernc.org/sqlite"
)

type standardCheck struct {
	id, table, field  string
	run               validationTypes.Check
	columns, required []string
}

func emptyDatabase(t *testing.T) *sql.DB {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "gtfs.sqlite"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	db.SetMaxOpenConns(1)
	return db
}

// Imported GTFS values are TEXT or NULL. A single connection catches lookups
// that accidentally retain an outer cursor while querying related rows.
func addTable(t *testing.T, db *sql.DB, table string, columns []string, rowIDs []int, rows [][]any) {
	t.Helper()
	definitions, placeholders := make([]string, len(columns)), make([]string, len(columns))
	for i, column := range columns {
		definitions[i], placeholders[i] = `"`+column+`" TEXT`, "?"
	}
	if _, err := db.Exec(`CREATE TABLE "` + table + `" (` + strings.Join(definitions, ",") + `)`); err != nil {
		t.Fatal(err)
	}
	query := `INSERT INTO "` + table + `" (rowid, "` + strings.Join(columns, `","`) + `") VALUES (?,` + strings.Join(placeholders, ",") + `)`
	for i, row := range rows {
		if _, err := db.Exec(query, append([]any{rowIDs[i]}, row...)...); err != nil {
			t.Fatal(err)
		}
	}
}

func fixture(t *testing.T, table string, columns []string, rowIDs []int, rows [][]any) *sql.DB {
	t.Helper()
	db := emptyDatabase(t)
	addTable(t, db, table, columns, rowIDs, rows)
	return db
}

func runCheck(t *testing.T, check standardCheck, db *sql.DB, config rules.RuleContext) (*context.ValidationContext, []messages.Message) {
	t.Helper()
	collector := &testutil.Collector{}
	ctx := context.NewRuleContext(check.id, db, config, collector)
	if err := check.run(ctx); err != nil {
		t.Fatalf("validation returned an operational error: %v", err)
	}
	if ctx.Source != nil || ctx.Row != -1 {
		t.Fatalf("row context leaked to caller: %+v", ctx)
	}
	return ctx, collector.Messages
}

func assertRows(t *testing.T, check standardCheck, ctx *context.ValidationContext, findings []messages.Message, severity rules.Severities, rows ...int) {
	t.Helper()
	if ctx.Failed != (len(rows) > 0) || ctx.Skipped {
		t.Fatalf("unexpected outcome: %+v", ctx)
	}
	if len(findings) != len(rows) {
		t.Fatalf("got %d findings, want %d: %+v", len(findings), len(rows), findings)
	}
	if severity == rules.SEVERITY_FORBIDDEN {
		severity = rules.SEVERITY_ERROR
	}
	for i, m := range findings {
		var expectedRows []int
		if rows[i] >= 0 {
			expectedRows = []int{rows[i]}
		}
		if m.RuleID != check.id || m.FileName != check.table+".txt" || m.Field != check.field || m.Severity != severity || !m.SeverityResolved || !slices.Equal(m.Rows, expectedRows) || m.Message == "" {
			t.Errorf("unexpected finding: %+v", m)
		}
		if strings.Contains(m.Message, "%!") {
			t.Errorf("invalid translation formatting: %q", m.Message)
		}
	}
}
